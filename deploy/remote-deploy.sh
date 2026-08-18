#!/usr/bin/env bash
#
# Runs ON THE VPS, piped in over stdin by .github/workflows/deploy.yml.
#
# It arrives as a file on stdin rather than as an argument string, so nothing
# here passes through a shell-quoting layer. The workflow prepends the variable
# assignments it needs (SITE_PATH, GHCR_USERNAME, GHCR_PAT), each escaped with
# printf %q.
#
# Keeping it in the repository rather than inline in the YAML means it can be
# read, reviewed and — the point of this file — run by hand when a deploy fails:
#
#   ssh deploy@<host> 'SITE_PATH=/opt/sites/<site> bash -s' < deploy/remote-deploy.sh
#
set -uo pipefail

SITE_PATH="${SITE_PATH:-}"
GHCR_USERNAME="${GHCR_USERNAME:-}"
GHCR_PAT="${GHCR_PAT:-}"
SITE_URL="${SITE_URL:-}"

fail() { echo "::error::$*"; exit 1; }

# Print .env for diagnosis WITHOUT printing credentials.
#
# GitHub masks values it was given as repository secrets. SMTP_PASS is not one
# of them — it lives only in .env on the server and has never passed through
# Actions — so nothing would mask it, and this script's output is a public CI
# log on a public repository. Redact by key name, which stays correct as keys
# are added.
show_env() {
  sed -E 's/^([A-Za-z_][A-Za-z0-9_]*(PASS|PASSWORD|SECRET|TOKEN|KEY|PAT))=.+/\1=***redacted***/I' .env \
    | grep -v '^#' | grep -v '^$' | sed 's/^/    /'
}

echo "==> host $(hostname), user $(whoami)"

# --- locate the stack ------------------------------------------------------
# Checked explicitly rather than left to `cd`, because a bare `cd` into a
# missing directory writes to stderr and exits 1, which surfaces in CI as an
# exit code and nothing else. This is the most likely thing to be wrong on a
# first deploy, and it recurs after any rename of the site directory.
[ -n "$SITE_PATH" ] || fail "VPS_SITE_PATH is empty — set it in the repository secrets."

if [ ! -d "$SITE_PATH" ]; then
  echo "Directories that DO exist under /opt/sites:"
  ls -1 /opt/sites 2>/dev/null | sed 's|^|  /opt/sites/|' || echo "  (/opt/sites is missing)"
  fail "VPS_SITE_PATH does not exist on the server: '$SITE_PATH'"
fi

cd "$SITE_PATH" || fail "cannot enter $SITE_PATH"
[ -f .env ] || fail "no .env in $SITE_PATH — compose has no IMAGE, CONTAINER_NAME or SITE_PORT."

# An EMPTY .env passes `-f`, and that is not theoretical — a heredoc
# interrupted mid-paste leaves exactly that, because `tee` truncates the file
# the moment it opens. Compose then fails on an unset variable, several steps
# later, naming neither this file nor the missing key. Check the contents.
missing=""
for key in IMAGE CONTAINER_NAME SITE_PORT; do
  grep -q "^${key}=." .env || missing="$missing $key"
done
if [ -n "$missing" ]; then
  echo "Current .env:"
  show_env
  echo
  echo "Write it with a single command rather than a heredoc — an interrupted"
  echo "paste truncates the file:"
  echo "  printf 'IMAGE=...\\nCONTAINER_NAME=...\\nSITE_PORT=...\\n' > $SITE_PATH/.env"
  fail "missing or empty in .env:$missing"
fi

# A stale SITE_URL in .env is worse than none: it reads as authoritative while
# having no effect whatsoever, because the origin is baked in at build time (see
# lib/site-url.ts). Strip it so there is exactly one place the hostname lives —
# the SITE_URL repository variable.
if grep -q '^SITE_URL=' .env 2>/dev/null; then
  tmp=$(mktemp "$PWD/.env.XXXXXX")
  grep -v '^SITE_URL=' .env > "$tmp"
  chmod 644 "$tmp"
  mv "$tmp" .env
  echo "==> removed inert SITE_URL from .env (it is a build arg, not a runtime value)"
fi

# --- how the port is published --------------------------------------------
#
# The SITE_URL repository variable is the signal for "a domain exists".
#
#   unset  -> no hostname, so Caddy has nothing to obtain a certificate for and
#             nothing to proxy. Bind 0.0.0.0 so the site can be reached on the
#             server's IP, which is the only way to see it at all.
#   set    -> a domain is configured. Bind 127.0.0.1 so the port is private and
#             Caddy is the only public listener, holding TLS in one place.
#
# Managed here rather than left to whoever edits .env, because the dangerous
# direction is the one you forget: a BIND_ADDR left behind after DNS goes live
# keeps a plaintext copy of the site exposed next to the HTTPS one, serving the
# same consultation form. This closes it automatically on the deploy that first
# sees a SITE_URL.
set_env_key() {
  tmp=$(mktemp "$PWD/.env.XXXXXX")
  grep -v "^$1=" .env > "$tmp"
  [ -n "${2:-}" ] && echo "$1=$2" >> "$tmp"
  chmod 644 "$tmp"
  mv "$tmp" .env
}

if [ -z "$SITE_URL" ]; then
  if ! grep -q '^BIND_ADDR=0.0.0.0' .env; then
    set_env_key BIND_ADDR 0.0.0.0
    echo "==> no SITE_URL variable set; publishing on 0.0.0.0 so the site is reachable by IP"
  fi
  echo "::warning::Serving on the public IP over plain HTTP — no certificate."
  echo "    Anything typed into the consultation form crosses the network in the clear."
  echo "    Fine for review; set the SITE_URL variable and point DNS before running ads."
  echo "    If a firewall is active the port also has to be open: sudo ufw allow <port>/tcp"
elif grep -q '^BIND_ADDR=' .env; then
  set_env_key BIND_ADDR ""
  echo "==> SITE_URL is set, so removed BIND_ADDR — the port is private again and Caddy fronts it"
fi

# Report what the image was actually built with, so a wrong hostname shows up
# here rather than in Google Search Console weeks later.
img=$(grep '^IMAGE=' .env | cut -d= -f2-)
baked_origin() {
  docker image inspect "$img" --format '{{json .Config.Env}}' 2>/dev/null \
    | tr ',' '\n' | grep -o 'SITE_URL=[^"]*' | head -1 | cut -d= -f2-
}

echo "==> $SITE_PATH"
show_env

# --- lead delivery ---------------------------------------------------------
# Without SMTP credentials the API route logs each consultation request and
# answers the visitor normally, which is the right behaviour for a preview but
# is a silent black hole in production: the form works, the thank-you page
# appears, the conversion fires, and nobody is ever told a patient asked for an
# appointment. It cannot be detected by looking at the site, so it is reported
# here — the one place someone looks after every deploy.
smtp_missing=""
for key in SMTP_HOST SMTP_USER SMTP_PASS; do
  grep -q "^${key}=." .env || smtp_missing="$smtp_missing $key"
done
if [ -n "$smtp_missing" ]; then
  echo "::warning::Lead emails are NOT being sent — missing in .env:$smtp_missing"
  echo "    Consultation requests are written to the container log and nowhere else:"
  echo "      docker compose logs web | grep '\[lead\]'"
  echo "    See 'Lead delivery' in docs/deployment.md for the four keys to add."
else
  echo "==> lead email configured: $(grep '^SMTP_HOST=' .env | cut -d= -f2-) as $(grep '^SMTP_USER=' .env | cut -d= -f2-)"
fi

command -v docker >/dev/null || fail "docker is not on PATH for this user."

# --- registry --------------------------------------------------------------
# A public repository publishes a public package, and a public package pulls
# anonymously. Only authenticate when a token was actually supplied — otherwise
# an unset secret becomes a `docker login` with an empty password, failing a
# deploy that had no need to log in at all.
if [ -n "$GHCR_PAT" ]; then
  echo "==> logging in to ghcr.io as $GHCR_USERNAME"
  echo "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin \
    || fail "GHCR login failed — check GHCR_PAT has read:packages."
else
  echo "==> no GHCR_PAT set; pulling anonymously (package must be public)"
fi

# --- pull and restart ------------------------------------------------------
echo "==> pulling"
docker compose pull || fail "docker compose pull failed. If the package is private, set GHCR_PAT + GHCR_USERNAME. If the image name is wrong, fix IMAGE= in .env."

# Compare what the freshly pulled image was built with against the variable this
# deploy was given. They disagree when the SITE_URL variable was changed without
# rebuilding — the deploy succeeds, the site serves, and every canonical URL and
# sitemap entry still points at the old host. Silent, and expensive to discover.
got=$(baked_origin)
if [ -n "$SITE_URL" ] && [ "${got%/}" != "${SITE_URL%/}" ]; then
  echo "::warning::Image was built with SITE_URL='${got:-<unset>}' but the variable is now '$SITE_URL'."
  echo "    The origin is baked in at build time. Re-run the workflow to rebuild;"
  echo "    restarting will not pick this up."
else
  echo "==> image origin: ${got:-<unset, defaults apply>}"
fi

echo "==> starting"
# Retried, because `up` has one failure mode that is transient and one that is
# not, and they are worth telling apart.
#
# Transient: the daemon is still tearing down the previous container and
# answers with "removal of container <id> is already in progress". Waiting a
# few seconds and asking again works. The usual cause is two deploys
# overlapping — the workflow now serialises them with a `concurrency` group,
# so this should be rare — but a stale `docker rm` run by hand on the box
# produces exactly the same race, and that is outside anything CI controls.
#
# Real: a bad image, a port already bound, a broken .env. Those fail the same
# way on every attempt, so the loop costs 15 seconds before reporting what it
# would have reported anyway.
up_ok=""
for attempt in 1 2 3; do
  if out=$(docker compose up -d --remove-orphans 2>&1); then
    printf '%s\n' "$out"
    up_ok=1
    break
  fi

  printf '%s\n' "$out"

  # Only retry the race. Anything else is a real failure and retrying it just
  # delays the error by fifteen seconds.
  case "$out" in
    *"is already in progress"*|*"removal of container"*)
      [ "$attempt" -lt 3 ] || break
      echo "==> container teardown still in progress; retrying in 5s (attempt $attempt/3)"
      sleep 5
      ;;
    *) break ;;
  esac
done
[ -n "$up_ok" ] || fail "docker compose up failed."

# --- wait for healthy, not merely started ----------------------------------
# `up -d` returns as soon as the process starts, which is well before Next is
# answering requests. Reporting success there would call a broken deploy green.
echo "==> waiting for health"
cid=$(docker compose ps -q web)
[ -n "$cid" ] || fail "no 'web' container after up -d."

for i in $(seq 1 30); do
  status=$(docker inspect --format='{{.State.Health.Status}}' "$cid" 2>/dev/null || echo starting)
  if [ "$status" = "healthy" ]; then
    echo "==> healthy after $((i * 5))s"
    docker ps --filter "id=$cid" --format '    {{.Names}} | {{.Status}} | {{.Ports}}'

    # Untagged layers accumulate fast and fill a small VPS disk.
    docker image prune -af --filter "until=168h" >/dev/null 2>&1 || true
    exit 0
  fi
  sleep 5
done

echo "container never became healthy — last 50 log lines:"
docker compose logs --tail=50 web
fail "deploy failed health check after 150s."

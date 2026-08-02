# Deployment — VPS · Docker · GitHub Actions

**Live at <https://surgery.luisfernandoreyesmd.com>.**

This project is the **second site on a server that was already set up**. Docker,
the `/opt/sites/` layout and the shared `deploy` user all exist from the Dr.
Nicole Echeverry deployment; none of that is repeated here. Caddy did *not* —
see [§3](#3--dns-and-caddy).

What is specific to this repo:

| | |
|---|---|
| Public origin | `https://surgery.luisfernandoreyesmd.com` |
| Site directory | `/opt/sites/dr-luis-landing-pages` |
| Container | `dr-luis-landing-pages` |
| Image | `ghcr.io/dus1han/dr_luis_fernando_reyes_landing_pages:latest` — **lowercase** |
| Port | **3102**, bound to `127.0.0.1` (3101 belongs to `dr-nicole-landing-pages`) |
| Health | `GET /` — the root index, which every page in this repo sits under |

The full server-level procedure — installing Docker, the firewall, creating the
`deploy` user — lives in the Nicole repo's `docs/deployment.md` and is not
duplicated. This file covers what is left.

---

## Status

| Step | State |
|---|---|
| Repo has Dockerfile, compose, workflow, deploy script | ✅ |
| Image builds and serves | ✅ see [§5](#5--what-was-verified) |
| GitHub secrets and variables | ✅ incl. `SITE_URL` |
| `/opt/sites/dr-luis-landing-pages/.env` on the VPS | ✅ [§2](#2--the-env-file-on-the-vps) |
| DNS A record → `169.58.92.105`, unproxied | ✅ [§3](#3--dns-and-caddy) |
| Caddy running server-wide, certificate issued | ✅ [§3](#3--dns-and-caddy) |
| First deploy | ✅ |

Verified live: HTTPS 200 on `/`, `/buccal-fat-removal`,
`/buccal-fat-removal/thank-you`, `/robots.txt` and `/sitemap.xml`; HTTP 308 to
HTTPS; canonical and `og:url` on the real origin; `noindex` on both the root hub
and the thank-you page; HSTS, `nosniff` and `Referrer-Policy` present; Let's
Encrypt certificate valid to 31 Oct 2026 and auto-renewing.

The one thing still not wired is lead delivery — `deliver()` in
[app/api/lead/route.ts](../app/api/lead/route.ts) is a stub, so submissions only
reach the container log. See [§6 of ads-readiness.md](ads-readiness.md).

---

## 1 · The two build-time values

**Both are baked into the image. Neither can be changed by editing `.env` and
restarting.** This is the single most important thing on this page, because
getting it wrong fails silently — the build goes green, the site looks perfect,
and something is quietly wrong for weeks.

| Variable | Kind | Why it is build-time |
|---|---|---|
| `NEXT_PUBLIC_GTM_ID` | repository **variable** | `NEXT_PUBLIC_*` is compiled into the JavaScript |
| `SITE_URL` | repository **variable** | `/` and `/buccal-fat-removal` are statically prerendered, so canonical tags, `og:url` and the JSON-LD are written into HTML on disk during `next build` |

Set them at **Settings → Secrets and variables → Actions → Variables**. Both are
optional; unset, the build falls back to no analytics and to
`https://surgery.luisfernandoreyesmd.com`. Both survive every push — you never
re-enter them. Changing either needs a **rebuild**: push, or *Actions → Run
workflow*.

> ### The origin lives in exactly one place: the `SITE_URL` repository variable
> Not in `.env`, not in `docker-compose.yml`, not in `lib/site.ts`. That was
> verified rather than assumed — with `SITE_URL` set only in the container's
> environment, the canonical tag still carried the build-time default, because
> the page had already been written to disk.
>
> Three things keep it honest:
>
> - `docker-compose.yml` deliberately does **not** set it.
> - `deploy/remote-deploy.sh` **strips** it from `.env` if anyone adds it.
> - The same script compares the origin baked into the pulled image against
>   the current variable and **warns when they disagree** — which is what
>   happens if the variable is changed without a rebuild.

The workflow prints both values on the run summary. Read it after the first
deploy — a missing GTM ID is the failure you would otherwise discover from an
empty Google Ads report.

---

## 2 · The `.env` file on the VPS

The only file created by hand. `docker-compose.yml` is shipped by every deploy,
so changes to it in this repo actually reach the server; `.env` is never
touched, because it holds the values that are specific to this installation.

```bash
SITE=dr-luis-landing-pages
PORT=3102

sudo mkdir -p /opt/sites/$SITE
sudo chown -R deploy:deploy /opt/sites/$SITE
cd /opt/sites/$SITE

sudo -u deploy tee .env >/dev/null <<EOF
IMAGE=ghcr.io/dus1han/dr_luis_fernando_reyes_landing_pages:latest
CONTAINER_NAME=$SITE
SITE_PORT=$PORT
EOF
```

> **No `SITE_URL` here.** It is a build arg, not a runtime value — see
> [§1](#1--the-two-build-time-values). `deploy/remote-deploy.sh` strips it from
> this file on every deploy, because a line that reads as authoritative and
> does nothing is worse than no line at all.
>
> **No `BIND_ADDR` either** — the same script sets or removes it based on
> whether the `SITE_URL` variable exists. See [§3](#before-dns-exists--this-is-automatic).

**Write it with one command, not a heredoc.** An interrupted paste leaves the
file empty, because `tee` truncates it the moment it opens — and an empty
`.env` passes a `[ -f ]` test, so the failure surfaces later as a compose error
about an unset variable. The deploy now checks the three keys are actually
present and names the missing ones, but the simplest fix is not to create the
problem:

```bash
sudo -u deploy bash -c 'printf "IMAGE=ghcr.io/dus1han/dr_luis_fernando_reyes_landing_pages:latest\nCONTAINER_NAME=dr-luis-landing-pages\nSITE_PORT=3102\n" > /opt/sites/dr-luis-landing-pages/.env'
```

### The port register

| Port | Project |
|---|---|
| 3101 | `dr-nicole-landing-pages` |
| **3102** | **this project** |
| 3103+ | free |

**Two sites on one port means the second container silently fails to start** —
nothing warns you, the deploy still reports success, and the first site keeps
serving. Confirm nothing else has taken 3102 before the first deploy, and write
the port down in the register when a third project claims one:

```bash
sudo ss -ltnp | grep -E ':310[0-9]'
```

> The Dr. Nicole repo's `docs/deployment.md` carries the same register and
> still lists 3102 as free. Update it there too, or the next project reads a
> stale table and takes this port.
>
> Its `Dockerfile` also declares `ARG SITE_URL` in the builder stage only. That
> is enough to bake the origin correctly, but **not** enough for the drift
> check its own `remote-deploy.sh` performs — `docker image inspect` on the
> final image shows nothing, so the comparison runs against an empty string and
> reports `<unset>` every time. Re-declaring `ARG SITE_URL` / `ENV SITE_URL` in
> the runner stage fixes it; verified here both ways.

> `IMAGE` must be **all lowercase**. `docker/metadata-action` lowercases the
> repository name when it publishes, and Docker rejects uppercase in image
> references — this repo is `Dr_Luis_Fernando_Reyes_Landing_Pages`, so the
> published package is `dr_luis_fernando_reyes_landing_pages`. Confirm the exact
> name under the GitHub **Packages** tab after the first build. A mismatch shows
> up as an opaque `docker compose pull` failure that never names the cause.

If the package is private, `GHCR_USERNAME` and `GHCR_PAT` are needed as secrets.
A public repository publishes a public package, which pulls anonymously — the
deploy script skips the login rather than failing. Package visibility is **not**
the same setting as repository visibility and does not always follow it.

---

## 3 · DNS and Caddy

The live hostname is **`surgery.luisfernandoreyesmd.com`**, one A record
straight at `169.58.92.105`. It is not behind a CDN — if it is ever put behind
Cloudflare, the record must be `DNS only` (grey cloud) until the certificate
issues, because an orange proxy intercepts the HTTP challenge and the
certificate never arrives.

```bash
dig +short surgery.luisfernandoreyesmd.com   # expect 169.58.92.105
```

**The A record must resolve before Caddy is reloaded**, or the certificate
request fails and Caddy backs off before retrying.

> **This is now done — `/opt/sites/caddy` exists and holds the block below.**
> Kept here because the trap that caused it will recur on the next server.
>
> Caddy was *not* running on this VPS when the site first went up, despite the
> rest of the server being set up. That was measured, not assumed: 80 and 443
> were both closed from outside while 3101 (the Nicole site) answered directly.
> Both sites had only ever been previewed on their raw ports, so nothing had
> needed a reverse proxy before — and setting `SITE_URL` correctly is what
> exposed it, because the deploy script then moved this site off `0.0.0.0` and
> onto `127.0.0.1` with nothing in front of it. The symptom is "the site stopped
> loading right after I set the URL", and the cause is the missing proxy, not
> the URL.
>
> Check which case you are in before assuming a reload is all that is required:
>
> ```bash
> docker ps --filter name=caddy
> ```

**If a `caddy` container is already running**, append the block from
`deploy/Caddyfile.example` to the server-wide `/opt/sites/caddy/Caddyfile` —
do not overwrite it, it holds every other site — then:

```bash
cd /opt/sites/caddy
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

Reload, not restart: the other sites never drop a request, and Caddy validates
the config before swapping it in, so a typo fails loudly instead of taking
every site on the server down.

**If there is no `caddy` container**, this is the server's first one. Copy both
files across, then start it:

```bash
sudo mkdir -p /opt/sites/caddy/logs && cd /opt/sites/caddy
# docker-compose.yml  <- deploy/caddy-compose.yml
# Caddyfile           <- deploy/Caddyfile.example
docker compose up -d
docker compose logs -f caddy      # watch the certificate issue
```

Two things block it silently at this point:

- **The firewall.** `sudo ufw status` — 80 and 443 must both be allowed, or
  Let's Encrypt cannot reach the challenge and nothing explains why.
  `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`.
- **A port 80 already in use** by a stray nginx or Apache. `sudo ss -lntp |
  grep -E ':(80|443)\b'` names the process; Caddy exits at startup if it cannot
  bind, and the compose `restart: unless-stopped` then hides it as a loop.

> **One Caddy block serves this whole repo.** `/buccal-fat-removal` and pages
> 2–4 are routes in one app on one port. They do not get a block, a port or a
> container each — see [§4](#4--another-page-is-not-another-deployment).

### Before DNS exists — this is automatic

**You do not set `BIND_ADDR` by hand.** `deploy/remote-deploy.sh` manages it,
using the `SITE_URL` repository variable as the signal for "a domain exists":

| `SITE_URL` variable | Binding | Why |
|---|---|---|
| **unset** | `0.0.0.0` — reachable on the server's IP | There is no hostname, so Caddy has nothing to get a certificate for and nothing to proxy. Exposing the port is the only way to see the site at all |
| **set** | `127.0.0.1` — private | A domain is configured, so Caddy fronts it and holds TLS in one place |

Setting the variable and redeploying **closes the public port on its own**.
That direction is the one that matters: a `BIND_ADDR` left behind after DNS goes
live keeps a plaintext copy of the site running beside the HTTPS one, serving
the same consultation form. Automating it means nobody has to remember.

⚠️ While the port is public it is **plain HTTP with no certificate**. Anything
typed into the form crosses the network in the clear. Fine for showing the
clinic a draft; not for a live campaign. The deploy log prints this warning on
every run that exposes it.

If a firewall is active the port also has to be open — `sudo ufw status`, and
`sudo ufw allow <port>/tcp` if it is. The script cannot check this for you: the
`deploy` user has no sudo.

---

## 4 · Another page is not another deployment

Adding `/rhinoplasty` to this repo is a route and a `git push`. No port, no
container, no DNS record, no Caddy change. The root index picks it up from
`lib/pages.ts`.

`SITE_PORT` distinguishes **clients**, not routes — which is why the directory
is `dr-luis-landing-pages` and not named after any one page.

A different client is the full checklist: separate repo, image, container, port
and hostname.

---

## 5 · What was verified

Measured locally against a real image build, not assumed:

| Check | Result |
|---|---|
| `output: 'standalone'` produces a runnable server | ✅ `.next/standalone/server.js` |
| Standalone serves every route | ✅ `/`, `/buccal-fat-removal`, `/icon.png` 200; unknown path 404 |
| sharp traced into the bundle | ✅ `node_modules/sharp` + `@img` present after `outputFileTracingIncludes` |
| **Image builds** | ✅ first attempt, no iteration |
| **Image size** | ✅ 327MB |
| **Container reaches `healthy`** | ✅ via the `HEALTHCHECK` |
| **Image optimisation inside Alpine** | ✅ `/_next/image` returned an optimised JPEG — this is the check that catches a missing sharp |
| `SITE_URL` build arg reaches prerendered HTML | ✅ canonical, `og:url` and JSON-LD all carried the passed origin; zero occurrences of the default |
| `NEXT_PUBLIC_GTM_ID` build arg reaches the page | ✅ present in the prerendered HTML |
| Baked origin readable on the **final** image | ✅ `SITE_URL` re-declared in the runner stage — ARGs do not cross stages, and without it `remote-deploy.sh`'s drift check compares against an empty string and never fires |
| Drift check warns when the variable and the image disagree | ✅ simulated both ways: matching origin quiet, mismatched origin warns |
| `/api/lead` validation alive in the container | ✅ empty body → 400 |
| Security headers survive the container | ✅ nosniff, Referrer-Policy, X-Frame-Options |
| Runs unprivileged | ✅ `nextjs`, not root |

---

## 6 · Operations

```bash
cd /opt/sites/dr-luis-landing-pages

docker compose logs -f web
docker compose ps
docker compose restart web
```

| | |
|---|---|
| `docker-compose.yml` | **overwritten from the repo every deploy** |
| the image | pulled fresh from GHCR |
| `.env` | **never touched** |

### Deploy by hand

`deploy/remote-deploy.sh` is the same script Actions pipes over SSH, kept as a
file so you can run it yourself when a deploy misbehaves:

```bash
ssh deploy@<host> 'SITE_PATH=/opt/sites/dr-luis-landing-pages bash -s' \
  < deploy/remote-deploy.sh
```

### Roll back

Every build is also tagged with its commit SHA:

```bash
sed -i 's|:latest|:sha-<commit>|' .env
docker compose up -d
```

Revert to `:latest` once the next good build ships.

---

## 7 · Troubleshooting

| Symptom | Cause |
|---|---|
| **`scp: dest open "***/docker-compose.yml": No such file or directory`** | The site directory does not exist on the server. `***` is the masked `VPS_SITE_PATH`. Create it and the `.env` — [§2](#2--the-env-file-on-the-vps) — then re-run from the Actions tab; no new commit needed. A preflight step now catches this before the `scp` and prints what *does* exist under `/opt/sites` |
| **`missing or empty in .env: …`** | The file exists but a key is absent or has no value. Usually a heredoc interrupted mid-paste — `tee` truncated it. Rewrite with the single-command form in [§2](#2--the-env-file-on-the-vps) |
| **Public IP on the site port does not answer** | By design once `SITE_URL` is set: the port binds to `127.0.0.1` and only Caddy is public. If `SITE_URL` is unset it binds `0.0.0.0`, and then it is either the container being down (`docker compose ps`) or a firewall (`sudo ufw status`) |
| **502 from Caddy** | Container down or on a different port. `docker compose ps`, then `curl -I http://127.0.0.1:<port>/` |
| **Certificate never issues** | DNS not pointing at the server, or Cloudflare proxy is orange |
| **Canonical tag shows the wrong domain** | `SITE_URL` was set on the server only. It is baked at build time — set the repository variable and rebuild |
| **GTM not firing** | `NEXT_PUBLIC_GTM_ID` set after the last build. Rebuild; a restart will not pick it up. View source and search for `GTM-` |
| **Images 500 in the container** | sharp missing from the standalone bundle — check `outputFileTracingIncludes` in `next.config.ts` |
| **`docker compose pull` fails opaquely** | `IMAGE` case mismatch, or a private package with no `GHCR_PAT` |
| **Port already allocated** | Two sites share a `SITE_PORT` |
| **`EBUSY` / `unlink` error during `npm run build` on Windows** | A `next start` or standalone server is still running and holding sharp's DLL. Kill it first — this bit during setup |

---

## 8 · Next.js specifics in this setup

**`output: 'standalone'` is required** and set. This app **cannot** be a static
export: `/api/lead` is a real server route.

**sharp is a devDependency here**, because the image pipeline is what pulls it
in — but Next also loads it at runtime to optimise images. Two consequences:
the Dockerfile's `npm ci` must keep dev packages, and
`outputFileTracingIncludes` must copy it into the standalone bundle. Miss either
and the container starts cleanly, then 500s on the first image request — a
deploy that looks entirely successful.

**Alpine needs `libc6-compat`** for sharp and Next's SWC binaries. It is in the
Dockerfile.

**Do not run `next build` while a dev or standalone server is running.** They
share `.next`, and on Windows the running server holds a lock on sharp's
`libvips` DLL, which fails the build with an `unlink` error that does not name
the cause.

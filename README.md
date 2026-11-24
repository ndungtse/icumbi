# icumbi

**Find a place to stay in Rwanda, and see what's around it.** ("Icumbi" is Kinyarwanda for a place to stay.)

- **Live site:** https://icumbi.ndungutsecharles.tech
- **Demo video:** <!-- TODO: paste the video link (max 2 minutes) -->
- **Login:** none needed. The API key is given in the submission comment.

## Why it exists

Booking sites show a room but not whether there is food, a bank, a pharmacy or a sight within walking distance. A traveller arriving in an unfamiliar Rwandan town has to guess. icumbi lists the places to stay in 23 areas and shows, for each one, what surrounds it.

## What you can do

1. **Home:** destination photos and an area search box.
2. **Area page:** places to stay as cards beside an embedded map. **Search** by name, **filter** by type (hotel, guest house, hostel, motel...) and **sort** by distance from the centre or by name. Hovering a card highlights its pin, and clicking a pin highlights its card.
3. **Place page:** details, photos taken nearby, and an embedded map of what is within **500 m, 1 km or 2 km**, by category: food, shops, money, health, transport, sights.

## Error handling

| What goes wrong | What the visitor sees |
|---|---|
| The places service is down, slow (8 s timeout) or answers with an error | A message and a "Try again" link, never a blank page or a stack trace |
| An area has no results | "No places to stay were found in this area yet." |
| A filter matches nothing | "No places match these filters." |
| A category has nothing nearby | "Nothing within 1 km. The nearest is 1.4 km away." |
| A link points to an unknown area or place | A "page doesn't exist" page |
| The photo service fails | The page simply shows without those photos |

## Run it locally

Node.js 24 or newer.

```bash
git clone <this repository> && cd icumbi
npm install
cp .env.example .env.local      # then put your Geoapify key in it
npm run dev                     # http://localhost:3000
```

A free key (no card) comes from [geoapify.com](https://www.geoapify.com/). Checks: `npm run lint` and `npm run typecheck`.

## How it works

- **Next.js** (App Router, TypeScript, Tailwind). The server calls Geoapify, so the key is never sent to the browser. Answers are kept in memory for an hour to save the free daily requests.
- **Map:** MapLibre GL on OpenFreeMap tiles (no key needed).
- **Photos:** nine destination photos in `public/photos`, credited on the pages; the photos on a place page are geotagged files from Wikimedia Commons found near it.
- **Files:** `src/lib/data.ts` (areas and categories), `src/lib/places.ts` (the API calls), `src/components` (interactive parts), `src/app` (pages), `deploy` (server files).

## Deployment

Two web servers (web-01, web-02) run the same build; a load balancer (lb-01, HAProxy) shares traffic between them. The site lives on its own host name, `icumbi.ndungutsecharles.tech`, beside the existing `www` site, which is not changed.

```
visitor ──> https://icumbi.ndungutsecharles.tech ──> lb-01 (HAProxy: HTTPS, round robin, health checks)
                                                        ├──> web-01 (nginx :80 ──> app :3000)
                                                        └──> web-02 (nginx :80 ──> app :3000)
```

**One build, copied to both servers.** The servers have 1 GB of memory, and two separate builds would have different file names, so a page from web-01 could ask web-02 for a file it doesn't have. The app is built once on Linux (on web-01) and the same archive is installed on both. (The servers are ARM machines, so the build must be made on ARM Linux, not on a Mac.)

Replace `<web-01-ip>`, `<web-02-ip>` and `<lb-01-ip>` with the servers' addresses. Commands run from the project folder on your computer unless the step says otherwise.

### 1. DNS

Add an **A record**: `icumbi` → `<lb-01-ip>`. Check with `dig +short icumbi.ndungutsecharles.tech`.

### 2. web-01: set up, build, install

```bash
rsync -az --exclude node_modules --exclude .next --exclude .git --exclude .env.local ./ ubuntu@<web-01-ip>:~/icumbi/
ssh ubuntu@<web-01-ip>
```

On web-01:

```bash
cd ~/icumbi
sudo deploy/setup-web.sh icumbi.ndungutsecharles.tech
sudo nano /etc/icumbi/icumbi.env           # set GEOAPIFY_KEY=...
export PATH=/opt/node/bin:$PATH NODE_OPTIONS=--max-old-space-size=700
npm ci && scripts/package.sh               # a few minutes; writes icumbi-release.tgz
sudo deploy/release.sh icumbi-release.tgz  # installs it, waits for the health check, rolls back if it fails
curl -s -H "Host: icumbi.ndungutsecharles.tech" localhost/api/health     # {"status":"ok"}
```

`setup-web.sh` adds a 1 GB swap file, installs Node.js 24 (checksum verified), creates a service user, installs a systemd service (listens on `127.0.0.1:3000`, memory-limited, restarts on failure and at boot) and adds an nginx site for the host name that forwards to the app and adds an `X-Served-By` header with the server's name. The default nginx site is not touched.

### 3. web-02: install the same build

From your computer:

```bash
scp ubuntu@<web-01-ip>:~/icumbi/icumbi-release.tgz .
rsync -az deploy ubuntu@<web-02-ip>:~/icumbi/
scp icumbi-release.tgz ubuntu@<web-02-ip>:~/icumbi/
ssh ubuntu@<web-02-ip>
```

On web-02:

```bash
cd ~/icumbi
sudo deploy/setup-web.sh icumbi.ndungutsecharles.tech
sudo nano /etc/icumbi/icumbi.env           # same GEOAPIFY_KEY
sudo deploy/release.sh icumbi-release.tgz
curl -s -H "Host: icumbi.ndungutsecharles.tech" localhost/api/health
```

### 4. Load balancer (on lb-01)

```bash
sudo cp /etc/haproxy/haproxy.cfg /etc/haproxy/haproxy.cfg.bak     # back up first

# A separate certificate for the new name; the existing www certificate is not touched.
sudo certbot certonly --standalone --http-01-port 8888 -d icumbi.ndungutsecharles.tech
sudo sh -c 'cat /etc/letsencrypt/live/icumbi.ndungutsecharles.tech/fullchain.pem \
  /etc/letsencrypt/live/icumbi.ndungutsecharles.tech/privkey.pem \
  > /etc/haproxy/certs/icumbi.ndungutsecharles.tech.pem'
sudo chmod 600 /etc/haproxy/certs/icumbi.ndungutsecharles.tech.pem
```

(Port 80 requests for `/.well-known/acme-challenge/` already go to certbot on port 8888 in the existing configuration.)

Then edit `/etc/haproxy/haproxy.cfg`, adding the three groups of lines in [deploy/haproxy-icumbi.cfg](deploy/haproxy-icumbi.cfg) where its comments say:

1. the second certificate on the `bind *:443` line of `https_front`;
2. an `acl` and `use_backend` for the `icumbi` host name in the same frontend;
3. a new `backend icumbi_servers` with both web servers, `balance roundrobin` and a health check on `/api/health`.

```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg && sudo systemctl reload haproxy
```

If the check fails, restore the backup and reload. HAProxy reads one file per certificate, so after each renewal the joined files must be rebuilt: add the small hook below.

```bash
sudo tee /etc/letsencrypt/renewal-hooks/deploy/haproxy.sh >/dev/null <<'EOF'
#!/bin/sh
umask 077
for dir in /etc/letsencrypt/live/*/; do
  name=$(basename "$dir")
  cat "$dir/fullchain.pem" "$dir/privkey.pem" > "/etc/haproxy/certs/$name.pem"
done
systemctl reload haproxy
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/haproxy.sh
```

### 5. Test it

```bash
curl -sI https://icumbi.ndungutsecharles.tech | head -1        # 200
curl -sI http://icumbi.ndungutsecharles.tech | head -1         # 301 to https
deploy/check-balance.sh https://icumbi.ndungutsecharles.tech/api/health 10
```

`check-balance.sh` prints which server answered each request (the `X-Served-By` header) and counts requests per server; it exits with an error if only one server answered. To show failover, run `sudo systemctl stop icumbi` on web-01: every answer then comes from web-02, with no errors. Start it again afterwards. The `www` site is unchanged: `curl -sI https://www.ndungutsecharles.tech`.

### Updating later

Either repeat the build on web-01 and `deploy/release.sh` on both servers, one at a time, or let GitHub Actions do it: on every push to `main` it lints, type-checks and builds on Linux, then releases to web-01 and web-02 in turn over SSH (enabled by the repository variable `DEPLOY_ENABLED=true` and the secrets `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_USER`, `WEB01_HOST`, `WEB02_HOST`, `SITE_URL`). A release that fails its health check is rolled back automatically, and a failure on web-01 stops the job so web-02 keeps the old version.

## Keys and security

One key: the Geoapify key. It lives in `/etc/icumbi/icumbi.env` on each server (readable by root and the service only) and in `.env.local` on your computer, and is only used on the server. `.gitignore` excludes every `.env` file except `.env.example`, which lists the name without a value. The app adds `X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy` headers, escapes all text it shows, and only links to `http(s)` websites.

## APIs and credits

- [Geoapify Places API](https://apidocs.geoapify.com/docs/places/): places to stay and nearby places. Data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
- [OpenFreeMap](https://openfreemap.org/): map tiles. © OpenMapTiles, data © OpenStreetMap. Drawn with [MapLibre GL JS](https://maplibre.org/).
- [Wikimedia Commons API](https://www.mediawiki.org/wiki/API:Geosearch): photos taken near a place. Authors and licences are shown on the page.
- Destination photos from Wikimedia Commons: Honeybarger (Kigali), Nina R (Volcanoes), Davyimage (Gisenyi), Adam Jones (Kibuye), Alex Niragira (Nyungwe), Emery045 (Akagera), Diego Tirira (Huye), Guswen (Nyanza), Fanny Schertzer (Lake Kivu, Rusizi); licences CC BY or CC BY-SA, listed on the home page.
- [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/).

## Challenges

- **Google Maps needed a billing card.** The first version used Google Places, but billing could not be kept active, so I rebuilt it on free services that need no card.
- **OpenStreetMap has no hotel photos or ratings.** Cards without a photo show an illustration of their type (hotel, guest house, hostel...), and the visual weight comes from destination photos, the map, and geotagged photos near each place.
- **Rwanda's shops and transport are thinly mapped.** The "nearby" categories use broad Geoapify groups, and an empty category says how far the nearest place is.
- **One build for two small servers.** See Deployment.
- **A second site on an existing load balancer.** It has its own host name, certificate and backend, added beside the existing site.

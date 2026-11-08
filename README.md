# Campus Events landing page

A static landing page for the Campus Events app. It sends visitors to the Android download page or the web app.
Plain HTML, CSS and JavaScript. No build step, no dependencies, no network requests besides the links.

## Files

```
index.html          the page (all copy and links are here)
404.html            shown by GitHub Pages for unknown URLs
css/style.css       styles (colours are variables at the top)
js/main.js          opening sequence, menu, scroll-lit statement, hero balls
assets/             logo, favicons, fonts (copied from the app repo)
.nojekyll           tells GitHub Pages to serve files as they are
.github/workflows/  deploy-pages.yml and reanimate-capture.yml (deploy-pages.yml on push or by hand, reanimate-capture.yml by hand)
robots.txt
```

## Publish on GitHub Pages

One-time setup:

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**. (If you skip this the deploy run fails with
   "Get Pages site failed" or a 404, and the site never goes live.)
2. Push to `main` (or open the **Actions** tab → **Deploy site** → **Run workflow**).
3. When the run finishes (about a minute) it shows the live address, `https://<your-username>.github.io/<repo-name>/`
   (for this repo: `https://real-debabrata.github.io/cemland/`).
   Name the repo `<your-username>.github.io` to get an address with no repo name in it.

Every push to `main` redeploys automatically. To publish only when you press the button, delete the `push:` trigger
(two lines) at the top of `.github/workflows/deploy-pages.yml`.

### If the site is not working

| What you see | Cause and fix |
|---|---|
| 404 at `https://<user>.github.io/cemland/` | Pages is not set to **GitHub Actions** (step 1), or no deploy has run yet. Check the Actions tab for a green run. |
| Deploy run is red | Open the run. "Get Pages site failed" means step 1 was not done. |
| Page stays black | `js/main.js` did not load or run. The page now drops the intro by itself after 6 seconds; open the browser console (F12) to see why the script failed. |
| Old version still showing | Hard-refresh (Ctrl/Cmd+Shift+R). Pages caches for a few minutes. |
| Looks wrong when you double-click `index.html` | Use a local server instead: `python3 -m http.server`, then open http://localhost:8000. |

## Record a reference site (manual button)

**Actions → Reanimate capture (manual) → Run workflow** records a site (default `https://lusion.co`) with the
[reanimate](https://github.com/real-debabrata/reanimate) skill, and records this page the same way.
When it finishes, download the artifact from the run page: it holds the video, `track.json` (element positions per frame),
`inspect.json` (declared animations and libraries), filmstrip sheets and, for canvas/WebGL, a trace.
Use `viewport` = `390x844` for the phone view, and `selector` / `trigger` to aim at one section.

### Custom domain (optional)

Add a file named `CNAME` containing only your domain, e.g. `campusevents.example.com`, then point a DNS `CNAME` record at `<your-username>.github.io`.
Do **not** reuse `cem.deba.indevs.in`: your app repo already owns that address.

## The opening sequence

A short intro plays on the first visit: a bar fills, folds into the Campus Events mark and opens onto the page, then the
header buttons, headline and scroll cue slide in (about 4.8 seconds in total, timings measured from the reference).
It is skipped on repeat visits in the same browser session, when the visitor prefers reduced motion, and when they click
the screen or press Esc. To replay it, add `?intro` to the address; to skip it, add `?nointro`.
To remove it entirely, delete the `<div class="loader">` block in `index.html`.

## Where the links go

| Link | Goes to |
|---|---|
| Download for Android | https://downloadcem.deba.indevs.in/ |
| Open web app | https://cem.deba.indevs.in/ |
| Sign in | https://cem.deba.indevs.in/login.html |
| Tutorials | https://cem.deba.indevs.in/tutorials/ |
| Privacy Policy | https://cem.deba.indevs.in/privacy.html |
| Terms & Conditions | https://cem.deba.indevs.in/terms.html |
| Contact | cem@deba.indevs.in |
| GitHub | https://github.com/real-debabrata/cem |

The privacy policy and terms are linked from the live app, so there is one copy to keep up to date.
To change a link, search `index.html` for the address and replace it (each appears in the menu, the footer and sometimes a button).

## If you change the address

`og:image` and `twitter:image` in `index.html` use the absolute address
`https://real-debabrata.github.io/cemland/assets/icons/og-image.png` (link previews need an absolute URL).
If you rename the repo or move to a custom domain, change those two lines, and the `cemland` name in the small script at the top of `404.html`.

## Fonts

Bricolage Grotesque and Figtree (open-source, bundled, no Google Fonts request).

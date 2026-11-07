# Campus Events landing page

A static landing page for the Campus Events app. It sends visitors to the Android download page or the web app.
Plain HTML, CSS and JavaScript. No build step, no dependencies, no network requests besides the links.

## Files

```
index.html          the page (all copy and links are here)
404.html            shown by GitHub Pages for unknown URLs
css/style.css       styles (colours are variables at the top)
js/main.js          menu, scroll-lit statement, hero balls
assets/             logo, favicons, fonts (copied from the app repo)
.nojekyll           tells GitHub Pages to serve files as they are
.github/workflows/  deploy-pages.yml and reanimate-capture.yml (both manual)
robots.txt
```

## Publish on GitHub Pages (manual button)

1. Create a **new, empty** repository (for example `cem-landing`) and upload everything in this folder to its root, including the hidden `.github` folder.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Open the **Actions** tab → **Deploy site (manual)** → **Run workflow**.
4. When it finishes (about a minute) the run shows the live address, `https://<your-username>.github.io/<repo-name>/`.
   (Name the repo `<your-username>.github.io` to get an address with no repo name in it.)

Nothing deploys on its own: the workflow only runs when you press the button, so edit as much as you like and publish when ready.

## Record a reference site (manual button)

**Actions → Reanimate capture (manual) → Run workflow** records a site (default `https://lusion.co`) with the
[reanimate](https://github.com/real-debabrata/reanimate) skill, and records this page the same way.
When it finishes, download the artifact from the run page: it holds the video, `track.json` (element positions per frame),
`inspect.json` (declared animations and libraries), filmstrip sheets and, for canvas/WebGL, a trace.
Use `viewport` = `390x844` for the phone view, and `selector` / `trigger` to aim at one section.

### Custom domain (optional)

Add a file named `CNAME` containing only your domain, e.g. `campusevents.example.com`, then point a DNS `CNAME` record at `<your-username>.github.io`.
Do **not** reuse `cem.deba.indevs.in`: your app repo already owns that address.

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

## After you know your landing page address

In `index.html`, change the `og:image` meta tag to an absolute URL on your own site, for example
`https://your-site/assets/icons/og-image.png`, so link previews use your copy.

## Fonts

Bricolage Grotesque and Figtree (open-source, bundled, no Google Fonts request).

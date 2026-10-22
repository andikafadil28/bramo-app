# BRAMO Promo Site

Static Astro website for BRAMO, deployed on Cloudflare Pages.

## Local development

```sh
npm install
npm run dev
```

## Cloudflare Pages with automatic Git deploys

Create a Pages project and connect the GitHub repository `andikafadil28/bramo-app`.

- Production branch: `main`
- Root directory: `promo-site`
- Build command: `npm run build`
- Build output directory: `dist`

Cloudflare Pages will install dependencies, build the static Astro site, and publish it after each push to `main`. Pull requests get preview deployments. No Worker adapter is needed because this site is static.

The website's download buttons point to the latest GitHub Release. Attach the official Windows installers to each release so visitors can download the current version.

# Adriano Battista Research Hub - Website 7 Source Build

Static, dependency-free English/French research authority website generated with Node only. This package restores the working July-style GitHub and Vercel structure: source files live in `src/`, the build script lives in `scripts/`, and Vercel outputs the website to `dist/`.

## What to Upload to GitHub

Upload the **contents of this folder** to the GitHub repository. Do not upload the ZIP file itself as one file.

The important files and folders are:

- `src/`: editable source content
- `scripts/`: build and local preview scripts
- `public/`: source images
- `dist/`: Vercel build output
- `vercel.json`: Vercel launch settings
- `package.json`: build scripts for Vercel

## Build

```bash
node scripts/build-site.mjs
```

Output is written to `dist/`.

## Serve locally

```bash
node scripts/serve.mjs
```

The local server defaults to `http://localhost:4173`.

For a real preview, use the local server above. Opening `index.html` by double-clicking is not the same as a Vercel/GitHub web server preview because browser file paths behave differently from website paths.

## Deployment

Vercel uses `vercel.json` with build command `node scripts/build-site.mjs` and output directory `dist`.

Recommended Vercel settings:

- Framework preset: Other
- Build command: `node scripts/build-site.mjs`
- Output directory: `dist`
- Install command: leave blank/default

## Version 7.0 Notes

- Blog, contact form, update signup form, and global query UI were removed.
- Footer now carries contact email plus icon-only links to LinkedIn, Google Scholar, and Amazon Author Page.
- Statistics are rendered with clickable short citations and full APA-style references.
- English is the default locale and French is generated as a full mirrored route tree under `/fr/`.
- Language switching preserves the current page, remembers the visitor's choice, and emits canonical plus `hreflang` alternates.
- Source content lives in `src/content.mjs`; French translations live in `src/translations.mjs`; templates live in `scripts/build-site.mjs`.

## Before Launch

- Replace `site.baseUrl` in `src/content.mjs` with the final domain.
- Public contact email is set in `src/content.mjs`.
- Re-check crisis resource phone numbers and links before publishing.

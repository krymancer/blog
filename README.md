# Blog

Personal blog at [krymancer.dev](https://krymancer.dev), built with [Astro](https://astro.build) and a hand-made minimal theme. Deployed to GitHub Pages via GitHub Actions.

## Commands

```sh
npm install      # install deps
npm run dev      # local dev server (http://localhost:4321)
npm run build    # build to ./dist
npm run preview  # preview the built ./dist
npm run check    # type-check .astro files
```

## Writing posts

Posts are Markdown files in `src/content/posts/`. Frontmatter (YAML):

```yaml
---
title: 'My Post Title'
date: 2026-03-16T23:31:07-03:00
draft: false   # optional, defaults to false; drafts are excluded from build
---
```

The filename (minus `.md`) is the URL slug, e.g. `10-proxmox.md` → `/posts/10-proxmox`.
To link between posts, use a plain path: `[see this](/posts/03-devlog-buzz)`.

## Images (Obsidian)

The repo root is an Obsidian vault. `.obsidian/app.json` is configured so pasted
images land in `public/attachments/`. A small remark plugin in `astro.config.mjs`
rewrites `attachments/…`, `./attachments/…`, and `public/attachments/…` image
paths to absolute `/attachments/…` URLs, so they resolve from any page.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`withastro/action` and deploys `./dist` to GitHub Pages. The custom domain is set
by `public/CNAME` (`krymancer.dev`).

## Structure

```
src/
  content/posts/     posts (markdown)
  content.config.ts  collection schema
  layouts/           Base.astro, Post.astro
  components/        Header, Footer, ThemeToggle
  pages/             index, archive, posts/[...slug], rss.xml
  lib/date.ts        date formatting (fixed America/Sao_Paulo)
  styles/global.css
public/              static assets, attachments, favicons, CNAME
```

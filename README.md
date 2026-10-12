# HomeShelf

## Run locally

**Prerequisites:** Node.js and pnpm

1. Install dependencies: `pnpm install`
2. Start the development server: `pnpm dev`

## Build and preview

Run `pnpm build` followed by `pnpm preview` to build and preview the production
app locally. Builds use `/` as their default base path so the preview works at
`http://localhost:4173/`.

For deployment under a repository subpath, set `VITE_BASE_PATH` to that path
when building. For example, for GitHub Pages at `/HomeShelf/`:

```sh
VITE_BASE_PATH=/HomeShelf/ pnpm build
```

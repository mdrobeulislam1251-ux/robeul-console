# Robeul Console

A full-viewport, SaaS-style profile app for **MD Robeul Islam**, built with [Refine](https://refine.dev) (`@refinedev/core`) + React + Vite.

**Live:** https://mdrobeulislam1251-ux.github.io/robeul-console/

- Every page reads its content through a Refine data provider (`src/dataProvider.ts`) over `src/data.ts`, so list views get real filtering, search and sorting.
- Case files are told documentary-style: the problem, what was built, the proof.
- Ctrl/Cmd + K command palette, light and dark themes, mobile drawer navigation.

```bash
npm install
npm run dev
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Profile READMEs

`readme/build.ts` generates both GitHub profile READMEs (and their SVG cards) from the same `src/data.ts`, using the console's design tokens, so the app and the profiles stay one system.

```bash
node readme/build.ts   # writes readme/out/<account>/README.md + assets/system/*.svg
```

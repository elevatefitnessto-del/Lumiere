# Lumiere

A GitHub Pages-ready storefront for Lumiere's 18-piece press-on nail edit.

## What is included

- Data-driven catalog in `public/products.json` with the 18 customer-facing product records.
- Customer-facing fields only in the public feed; supplier cost, landed cost, and gross margin are intentionally excluded from the storefront/API payload.
- Home page organized around French Classic, Luxe, After Dark, and Cat Eye.
- Shop filters for collection, tier/price, shape, badge, and price, plus sort and search.
- Product detail pages with image gallery, fit selector, care accordions, related products, and add-to-bag.
- Cart drawer with quantity editing, complimentary-shipping threshold, and checkout handoff shell.
- Ten locally generated Lumiere campaign images in `public/images/` so the site does not depend on supplier-hosted image URLs for the launch presentation.
- GitHub Pages workflow at `.github/workflows/deploy.yml`.

## Run locally

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal. To test the production build:

```bash
npm run build
npm run preview
```

## GitHub Pages

The workflow builds the Vite site and deploys `dist/` with GitHub Pages on pushes to `main` or this Arena branch. In the repository settings, Pages should use **GitHub Actions** as its source. The current storefront checkout is a static handoff shell; connect the checkout action to Stripe before accepting live payments.

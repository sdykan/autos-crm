# Autos CRM

CRM for used-car dealerships in Germany: stock of cars, clients and sales contracts (Kaufvertrag) generated as PDF in one click.

**Live demo:** https://2323-orcin.vercel.app — runs in demo mode: any email and a 6+ character password, all data is fictional.

## Features

- **Cars** — stock list with VIN, registration document number (Kfz-Brief), first registration (EZ), colour, purchase and sale price, status (In Stock / Reserved / Sold); export to Excel
- **Clients** — buyers with address data, linked to contracts
- **Sales contracts** — a Kaufvertrag PDF generated in the browser:
  - VAT options: standard VAT or margin scheme (§25a UStG)
  - sale within Germany, to an EU country (with or without VAT ID) or to a third country (with or without customs certificate)
  - vehicle condition, warranty exclusion, documents and keys handed over, payment by cash or bank transfer
- **Dashboard** — cars in stock, sales and contracts at a glance, with charts
- **Two languages** — German and Russian, switchable in the interface
- **Authentication** — email and password via Supabase Auth

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router 7 |
| UI | Ant Design 6, @ant-design/plots |
| Backend | Supabase (PostgreSQL, Auth) |
| Documents | jsPDF (contracts), ExcelJS (export) |
| i18n | i18next (DE, RU) |
| Hosting | Vercel |

## Demo mode

Without Supabase keys the app runs entirely in the browser on fictional data: 13 cars, 6 clients and 6 contracts, so every page and the PDF contract can be tried right away. Changes are saved in `localStorage`; the **Reset demo data** button in the header restores the original set. The demo client (`src/lib/demo`) implements the part of the Supabase API the app uses, so no page code knows which backend is active.

## Getting started

```bash
npm install
npm run dev             # demo mode, no setup needed
```

To work with real data, create a Supabase project and add its keys:

```bash
cp .env.example .env    # Supabase URL and anon key, your dealership details
```

The dealership details printed on contracts (name, address, tax number, VAT ID, bank account) come from `.env`. Without them the app uses fictional demo values (Musterautohaus GmbH).

Supabase tables used by the app: `cars`, `clients`, `contracts`. Enable Row Level Security so that only signed-in staff can read and change data.

## Project structure

```
src/
├── pages/            # Dashboard, Cars, Clients, Contracts, Login, public home page
├── components/       # Layout, language switcher, contract creation modal
├── pdf/contract/     # Kaufvertrag PDF: header, intro, price block, clauses, signatures, footer
├── config/           # Seller details and contract options
├── i18n/             # German and Russian translations
├── lib/supabase.ts   # Supabase client
└── utils/            # Excel export
```

## Build

```bash
npm run build     # type check + production build
npm run preview
```

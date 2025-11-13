# Billpay Frontend

The **Billpay Frontend** is a modern **Next.js** application that powers the user interface for the **Billpay** platform — supporting payments for **airtime, data, TV subscriptions, and electricity**.

This frontend is part of a **pnpm workspace monorepo**, alongside the backend service, enabling shared tooling, consistent configuration, and fast dependency management.

---

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Available Scripts](#available-scripts)
4. [Project Structure](#project-structure)
5. [Key Components](#key-components)
6. [Public Assets](#public-assets)
7. [Contributing](#contributing)

---

## Overview

The frontend provides a seamless interface for processing bill payments, managing transactions, and interacting with multiple providers.

It is built with:

* ⚡ **Next.js** – App Router & server components
* 🧱 **TypeScript** – Type-safe development
* 💅 **CSS Modules / Tailwind / custom styles** (depending on your styling setup)
* 🧩 **Reusable components** for payment flows and UI consistency
* 🧠 **Form validation schemas** for each bill category (airtime, data, TV, electricity)

---

## Setup

### Requirements

* Node.js ≥ 20
* pnpm ≥ 8
* Access to the backend API service (for real payment operations)

### Installation

From the monorepo root:

```bash
pnpm install
```

Start the frontend in development mode:

```bash
pnpm --filter frontend dev
```

Build for production:

```bash
pnpm --filter frontend build
```

Run linter:

```bash
pnpm --filter frontend lint
```

---

## Available Scripts

| Command                        | Description                         |
| ------------------------------ | ----------------------------------- |
| `pnpm --filter frontend dev`   | Starts the local development server |
| `pnpm --filter frontend build` | Builds the frontend for production  |
| `pnpm --filter frontend lint`  | Runs code quality checks            |

---

## Project Structure

```bash
frontend
├── app
│   ├── components
│   │   ├── Input.tsx
│   │   ├── SelectTrigger.tsx
│   │   ├── banner/
│   │   ├── billpay/
│   │   │   ├── airtime/
│   │   │   ├── data/
│   │   │   ├── electricity/
│   │   │   ├── TV/
│   │   │   ├── Beneficiaries.tsx
│   │   │   ├── NetworkAndPhone.tsx
│   │   │   ├── PaymentsTabs.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TransactionHistory.tsx
│   │   │   └── index.tsx
│   │   ├── buttons/
│   │   ├── card/
│   │   ├── layouts/
│   │   ├── transaction/
│   │   └── ui/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── lib/
│   ├── page.tsx
│   └── types/
├── public/
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## Key Components

### 🧭 Billpay Components (`app/components/billpay/`)

Core logic and UI for each bill type:

* **Airtime** – `Airtime.tsx`, `AirtimeAmount.tsx`, `AirtimeSummary.tsx`
* **Data** – `Data.tsx`, `DataBundleSelector.tsx`
* **TV** – `Tv.tsx`, `TvBundle.tsx`, `TvBundleSelector.tsx`
* **Electricity** – `Electricity.tsx`, `ElectricityAmount.tsx`, `ElectricitySummary.tsx`

Shared billpay utilities:

* `Sidebar.tsx` – Main navigation for bill types
* `PaymentsTabs.tsx` – Tabs for switching between payment flows
* `TransactionHistory.tsx` – Displays user payment history
* `Beneficiaries.tsx` & `NetworkAndPhone.tsx` – Input and management for saved users

---

### 🎨 UI & Layout Components

Reusable UI elements and layout helpers:

* **UI Core (`ui/`)**: `button.tsx`, `card.tsx`, `form.tsx`, `input.tsx`, `select.tsx`, `tabs.tsx`, etc.
* **Layout**: `app/components/layouts/header/`
* **Buttons & Cards**: `PaymentButton.tsx`, `BillCard.tsx`
* **Banners**: `app/components/banner/`

---

### 🧰 Utilities

* `lib/utils.ts` – Helper functions for formatting and computation
* `types/` – Shared TypeScript types:

  * `NetworkProviders.ts` – Defines supported providers
  * `transaction.ts` – Describes transaction structure and states

---

## Public Assets

All static files are located in the `public/` folder, including icons and logos:

```bash
public/
├── logo.svg
├── globe.svg
├── next.svg
├── vercel.svg
├── window.svg
└── file.svg
```

---

## Contributing

1. Clone the monorepo
2. Create a new branch:

   ```bash
   git checkout -b feat/your-feature-name
   ```

3. Run linter and verify your changes:

   ```bash
   pnpm --filter frontend lint
   ```

4. Commit using [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   feat: add new electricity payment component
   ```

5. Submit a pull request for review.

---

### Notes

* The frontend is tightly coupled with the backend service for validation and payment processing.
* Shared development and build scripts are defined in the root `package.json` of the pnpm workspace.
* Use environment variables (if applicable) via `.env.local` for backend API endpoints or tokens.

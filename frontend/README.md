# BillPay

BillPay is a secure and reliable **bill payment service** built with **NextJS**, **Shadcn.ui**, **Tailwind CSS**, **Interswitch** as the payment processor, **VTPass** and **Interswitch** as the biller aggregator.

With BillPay, users can conveniently purchase **airtime, data bundles, cable TV subscriptions, and electricity tokens** while businesses can rely on a robust backend for handling transactions at scale.  

---

## ✨ Features

- 📱 **Airtime Top-up** – Recharge any mobile line instantly.  
- 🌐 **Data Bundles** – Buy affordable internet data plans.  
- 📺 **Cable TV Subscription** – Renew DSTV, GOTV, Startimes, etc. with ease.  
- ⚡ **Electricity Bills** – Pay prepaid and postpaid electricity bills, receive tokens instantly.  
- 💳 **Interswitch Integration** – Secure payment collection and bill processing. 
- 💳 **Interswitch and VTPass Integration** – Multi-provider bill processing support.  
- 🕒 **24/7 Availability** – Always-on service for seamless bill payments.  

---

## 🛠️ Tech Stack

- **Frontend Framework**: [Nextjs](https://nextjs.org) – scalable Node.js framework.  
- **Payment Gateway**: [Interswitch](https://www.interswitchgroup.com/) – for biller APIs and payment collection.
Styling: [Tailwind CSS](https://tailwindcss.com/) – utility-first CSS framework for fast, responsive UI development.
UI Components: [shadcn/ui](https://tailwindcss.com/) – beautifully designed, accessible React components built with Radix and Tailwind.
- **Billers**: [Interswitch](https://www.interswitchgroup.com/) and [VTPass](https://www.vtpass.com) – for biller APIs.
- **Package Manager**: [pnpm](https://pnpm.io/) – fast, disk-efficient package manager.  

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v22+  
- [pnpm](https://pnpm.io/) v10+  

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/deveasyclick/billpay-web.git
   cd billpay
    ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

---

## 🗂️ Project Structure

```bash
├── README.md
├── app
│   ├── components
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── lib
│   ├── page.tsx
│   └── types
├── biome.json
├── components.json
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── public
└── tsconfig.json
```

---

## 🧪 Running Tests

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Fork the repo, open a PR, or raise an issue.

---

## 📜 License

This project is licensed under the **MIT License**.

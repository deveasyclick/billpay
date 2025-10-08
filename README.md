# BillPay

BillPay is a secure and reliable **bill payment service** built with **NestJS**, **Prisma ORM**, **PostgreSQL**, and **Redis**, using **Interswitch** as the payment processor and biller aggregator.  

With BillPay, users can conveniently purchase **airtime, data bundles, cable TV subscriptions, and electricity tokens** — while businesses can rely on a robust backend for handling transactions at scale.  

---

## ✨ Features

- 📱 **Airtime Top-up** – Recharge any mobile line instantly.  
- 🌐 **Data Bundles** – Buy affordable internet data plans.  
- 📺 **Cable TV Subscription** – Renew DSTV, GOTV, Startimes, etc. with ease.  
- ⚡ **Electricity Bills** – Pay prepaid and postpaid electricity bills, receive tokens instantly.  
- 💳 **Interswitch Integration** – Secure payment collection and bill processing.  
- 💾 **Persistent Storage** – PostgreSQL for relational data.  
- ⚡ **Caching & Queues** – Redis for caching, rate limiting, and background jobs.  
- 🔐 **Secure Transactions** – End-to-end encryption, JWT auth, and audit logs.  
- 🕒 **24/7 Availability** – Always-on service for seamless bill payments.  

---

## 🛠️ Tech Stack

- **Backend Framework**: [NestJS](https://nestjs.com/) – scalable Node.js framework.  
- **ORM**: [Prisma](https://www.prisma.io/) – type-safe database client.  
- **Database**: [PostgreSQL](https://www.postgresql.org/) – relational database for transactions and records.  
- **Cache & Queue**: [Redis](https://redis.io/) – caching, session management, and job queues.  
- **Payment Gateway**: [Interswitch](https://www.interswitchgroup.com/) – for biller APIs and payment collection.  
- **Auth**: JWT-based authentication with role-based access control.  
- **Package Manager**: [pnpm](https://pnpm.io/) – fast, disk-efficient package manager.  

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16+  
- [pnpm](https://pnpm.io/) v8+  
- [PostgreSQL](https://www.postgresql.org/) v13+  
- [Redis](https://redis.io/) v6+  
- [Prisma CLI](https://www.prisma.io/docs/getting-started)  
- Interswitch **client ID**, **client secret**, and **biller credentials**  

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/billpay.git
   cd billpay
    ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables in a `.env` file:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/billpay"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your_jwt_secret"

   # Interswitch API Credentials
   INTERSWITCH_CLIENT_ID="your_client_id"
   INTERSWITCH_CLIENT_SECRET="your_client_secret"
   INTERSWITCH_BASE_URL="https://sandbox.interswitchng.com" # or production URL
   ```

4. Run database migrations:

   ```bash
   pnpm prisma migrate dev --name init
   ```

5. Generate Prisma client:

   ```bash
   pnpm prisma generate
   ```

6. Start the development server:

   ```bash
   pnpm run start:dev
   ```

---

## 📦 API Endpoints (Examples)

| Method | Endpoint                  | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| POST   | `/api/v1/airtime`         | Purchase airtime (via Interswitch)   |
| POST   | `/api/v1/data`            | Buy a data bundle                    |
| POST   | `/api/v1/cabletv`         | Renew cable TV subscription          |
| POST   | `/api/v1/electricity`     | Pay electricity bill & get token     |
| GET    | `/api/v1/transactions`    | Get user transaction history         |
| POST   | `/api/v1/payments/init`   | Initialize a payment via Interswitch |
| POST   | `/api/v1/payments/verify` | Verify payment status                |

---

## 🔧 Development Workflow

- **Code Quality**: ESLint + Prettier
- **Database Management**: Prisma migrations + seeders
- **Caching**: Redis for sessions, rate limiting, and biller response caching
- **Background Jobs**: Redis queues for async tasks (payment reconciliation, retries)
- **Error Handling**: Global exception filters in NestJS
- **Testing**: Unit & integration tests with Jest

---

## 🗂️ Project Structure

```bash
src/
 ├── modules/
 │   ├── auth/           # Authentication & user management
 │   ├── payments/       # Interswitch payment integration
 │   ├── airtime/        # Airtime top-up
 │   ├── data/           # Data bundles
 │   ├── cabletv/        # Cable TV subscriptions
 │   ├── electricity/    # Electricity payments
 │   └── transactions/   # Transaction history & logs
 ├── common/             # Shared services, interceptors, filters, utils
 ├── prisma/             # Prisma schema and migrations
 ├── jobs/               # Background jobs (queues using Redis)
 ├── main.ts             # Application entry point
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

## 📌 Roadmap

- [ ] Add wallet system for users
- [ ] Scheduled bill payments & auto-renewals
- [ ] GraphQL API support
- [ ] Notifications (email/SMS/WhatsApp) for successful payments

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Fork the repo, open a PR, or raise an issue.

---

## 📜 License

This project is licensed under the **MIT License**.

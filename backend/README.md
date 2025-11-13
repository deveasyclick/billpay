# Billpay Backend

The **Billpay Bill Payment Service** handles bill payments across multiple providers (currently **Interswitch** and **VTPass**) and ensures reliable, validated, and auditable transactions. This service is part of a monorepo that also includes the frontend application.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Payment Flow](#payment-flow)
5. [Setup](#setup)
6. [Environment Variables](#environment-variables)
7. [Database & Migrations](#database--migrations)
8. [API Usage](#api-usage)
9. [Queue & Reconciliation](#queue--reconciliation)
10. [Seeding](#seeding-data)
11. [Testing](#testing)
12. [Contributing](#contributing)
13. [Folder Structure](#folder-structure-high-level)  
14. [Tradeoffs](#tradeoffs)

---

## Overview

The Bill Payment Service is responsible for:

- ✅ Customer and amount validation before processing payments
- ✅ Supports multiple bill providers (Interswitch & VTPass).
- ✅ Confirm payments via Interswitch Payment APIs.
- ✅ Automatic retries for pending transactions
- ✅ Asynchronous reconciliation using a queue (BullMQ)
- ✅ Bulk synchronization of billing plans from providers
- ✅ Detailed logging using Winston

It is implemented with **NestJS + TypeScript + Prisma**, and structured for scalability and maintainability.

---

## Features

- ✅ Customer and amount validation before processing payments  
- ✅ Supports multiple bill providers (Interswitch & VTPass)  
- ✅ Automatic retries for pending transactions  
- ✅ Asynchronous reconciliation using a queue  
- ✅ Bulk synchronization of billing plans from providers  
- ✅ Detailed logging using Winston  

---

## Architecture

### Core Modules

- **`BillsService`** – Main service for processing bill payments.
- **`PaymentService`** – Handles payment attempts and state management.
- **`InterswitchService`** – Integrates with Interswitch APIs.
- **`VTPassService`** – Integrates with VTPass APIs.
- **`BillRepository`** – Prisma-based repository for billing items.
- **`QueueService`** – Handles retry and reconciliation jobs.

### Key Concepts

1. **Validation**  
   Validates customer details and amount rules for each bill category (AIRTIME, DATA, TV, ELECTRICITY).

2. **Provider Selection**  
   Tries the requested provider first; falls back to other available providers if needed.

3. **Payment Attempt Logging**  
   Each attempt is logged in the database with the request payload, response, and status.

4. **Retry and Reconciliation**  
   Pending or failed payments are retried or added to a reconciliation queue.

5. **Sync Plans**  
   Fetches plans from Interswitch and VTPass and updates the local database using a cron job.

---

## Payment Flow

```bash
Client → BillsController → BillsService → PaymentService
          ↓                     ↓
      Validation          Provider API (Interswitch / VTPass)
          ↓                     ↓
     PaymentAttempt ← ← ← ← ← QueueService (Retries / Reconciliation)
          ↓
      Payment Status Update
          ↓
       Database (Postgres)
```

- Payments go through a state machine: `PENDING → PROCESSING → SUCCESS/FAILED`.
- Failed or pending transactions can be retried automatically.

---

## Setup

This project uses **pnpm** and is part of a monorepo.

```bash
# Clone the repo
cd backend

# Install dependencies
pnpm install

# Generate Prisma client
pnpm dlx prisma generate

# Apply database migrations
pnpm dlx prisma migrate dev

# Start development server
pnpm --filter backend dev

# Swagger docs available at:
http://localhost:3000/docs
```

Requirements:

- Node.js >= 24 (managed via nvm)
- PostgreSQL
- pnpm
- Redis (for BullMQ queue processing)

---

## Environment Variables

```bash
NODE_ENV=development
PORT=3000

# DATABASE
DB_URL=postgresql://user:password@localhost:5432/dbname

# REDIS
REDIS_URL=redis://localhost:6379

# INTERSWITCH
INTERSWITCH_CLIENT_ID=
INTERSWITCH_SECRET_KEY=
INTERSWITCH_TERMINAL_ID=
INTERSWITCH_API_BASE_URL=
INTERSWITCH_PAYMENT_BASE_URL=
INTERSWITCH_AUTH_URL=
INTERSWITCH_PAYMENT_REFERENCE_PREFIX=
INTERSWITCH_MERCHANT_CODE=
INTERSWITCH_WEBHOOK_SECRET=

# VTPASS
VTPASS_API_BASE_URL=
VTPASS_APIKEY=
VTPASS_SECRET_KEY=
VTPASS_PUBLIC_KEY=
```

---

## Database & Migrations

- The service uses **Prisma** for database interactions.
- Migrations are stored in `prisma/migrations`.
- Apply migrations with:

```bash
pnpm dlx prisma migrate deploy
```

- Generate Prisma client:

```bash
pnpm dlx prisma generate
```

---

## Seeding Data

```bash
pnpm prisma db seed
```

- Adds Interswitch and VTPass as providers.
- Adds default billing categories: AIRTIME, DATA, TV, ELECTRICITY, GAMING.

---

## API Usage

The service exposes a REST API via `BillsController`.
Swagger is the primary source of truth: `/docs`.

### Endpoints

#### **POST /bills/pay** – Pay a bill

**Request Example:**

```json
{
  "billingItemId": "cuid123",
  "paymentReference": "ref_456",
  "provider": "VTPASS"
}
```

**Response Example:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "paymentRef": "ref_456",
    "amount": 5000,
    "status": "SUCCESS",
    "metadata": { "rechargePin": "1234-5678" }
  }
}
```

#### **GET /bills/items** – Retrieve billing items

**Optional Query:**

```bash
GET /bills/items?provider=VTPASS
```

**Response Example:**

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "item123",
      "amount": 5000,
      "amountType": 1,
      "biller": { "name": "MTN", "billerId": "1029" },
      "provider": { "name": "VTPASS" },
      "name": "MTN 1GB Data",
      "internalCode": "mtn-data-1gb",
      "category": "DATA",
      "paymentCode": "mtn-1gb",
      "image": "https://example.com/image.png"
    }
  ]
}
```

> Swagger automatically generates request/response schemas, so manual updates are optional

---

## Queue & Reconciliation

- Uses **BullMQ** for asynchronous payment retries and reconciliation.

- Jobs include payment confirmation, fallback attempts, and error handling.

- **Redis** is required for queue processing.

---

## Testing

- End-to-end tests are located in `test/`.
- Run tests:

```bash
pnpm test
```

- Use mocks for external providers in `test/mocks`.

---

## Contributing

- Create feature branches from `main`.
- Follow coding standards and run linter before commits:

```bash
pnpm lint
```

- Write unit tests for new features.
- Submit pull requests with clear descriptions.

---

## Folder Structure (high-level)

```bash
├── src
│   ├── modules/bills
│   │   ├── bills.controller.ts
│   │   ├── bills.service.ts
│   │   ├── dtos/
│   │   └── utils/
│   ├── integration/interswitch
│   ├── integration/vtpass
│   └── prisma.service.ts
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── Dockerfile
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

---

## Notes

- Business logic (amount validation, provider selection, retries) is encapsulated in BillsService.
- Payments go through a state machine (PENDING → PROCESSING → SUCCESS/FAILED).
- Transactions and attempts are stored in Postgres with Prisma.
- Swagger docs automatically generate request/response schemas, so you don’t need to manually maintain examples in the README.

## Tradeoffs

While the Billpay service is designed for reliability and flexibility, certain tradeoffs were made:

1. **Immediate Payment Response**

   - Confirms user payments via API and returns a response immediately if payment is successful, rather than waiting for webhook confirmation.
   - **Tradeoff:** Improves UX with instant feedback, but introduces slight risk of reporting a success before full provider confirmation. Webhook reconciliation still ensures eventual consistency.

2. **Provider Fallback Logic**

   - If a requested provider fails, the system attempts fallback using internal code mapping.
   - **Tradeoff:** Fallback is not 100% reliable because internal code mappings may not exist for all providers or categories, especially dynamic ones.

3. **Plan Fetching and Mapping**

   - Plans are fetched dynamically from Interswitch and VTPass, with static plans merged locally.
   - **Tradeoff:** Certain items are filtered if their amounts or types don’t match expected rules (e.g., airtime > ₦5000 with amountType > 1), which could exclude valid provider offerings.

4. **Caching Tokens for Provider APIs**

   - API tokens for Interswitch are cached with expiry buffers and in-progress request deduplication.
   - **Tradeoff:** Reduces redundant API calls and improves performance, but if the cache is corrupted or missed, fetching a new token may cause a slight delay.

5. **Complex Internal Code Mapping**

   - Internal codes are generated per biller, category, and amount to unify VTPass and Interswitch items.
   - **Tradeoff:** Ensures consistency for reconciliation and reporting but adds complexity and potential mismatch for unrecognized billers or dynamic offerings.

6. **REST API vs. GraphQL**

   - REST endpoints are simple (`POST /bills/pay`, `GET /bills/items`).
   - **Tradeoff:** Limited flexibility for complex queries; multiple calls may be required for nested data.

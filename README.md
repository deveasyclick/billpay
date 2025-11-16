<img width="1359" height="771" alt="image" src="https://github.com/user-attachments/assets/2ff56d60-d69e-4040-a719-12cffefa422b" />


# 🧾 Billpay

Link: [Billpay](https://billspay.vercel.app/)

The **Billpay** monorepo powers a complete **bill payment platform** consisting of:

* 💳 **Backend Service** – Handles payments, validation, reconciliation, and provider integrations (**Interswitch**, **VTPass**).
* 💻 **Frontend Application** – Modern **Next.js** interface for managing and completing payments (airtime, data, TV, electricity).

This repository is organized as a **pnpm workspace** to streamline dependency management, code sharing, and developer experience.

---

## ⚙️ Tech Stack

| Layer        | Technologies                                                              |
| ------------ | ------------------------------------------------------------------------- |
| **Frontend** | Next.js 16 • TypeScript • Shadcn/ui •  TailwindCSS • pnpm • Biome (Linting/Formatting) |
| **Backend**  | NestJS • TypeScript • Prisma • PostgreSQL • Redis • BullMQ                |
| **Tooling**  | Docker • pnpm Workspaces • NVM (Node Version Manager) • Biome • Concurrently       |

---

## 📦 Structure

```bash
.
├── backend      # NestJS + Prisma Bill Payment Service
├── frontend     # Next.js Frontend Application
├── package.json # Shared workspace scripts and metadata
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

### pnpm Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'frontend'
  - 'backend'
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js ≥ 24 (managed via `.nvmrc`)
* pnpm ≥ 10
* PostgreSQL
* Redis (for background jobs, queues, and reconciliation)

---

### Installation

From the monorepo root:

```bash
pnpm install
```

This installs dependencies for both the **frontend** and **backend**.

---

## 🧩 Running the Apps

### Start both apps (in parallel)

```bash
pnpm dev
```

This runs both the **frontend** and **backend** together using `concurrently`, with color-coded logs (like Turborepo).

### Or start individually

### Frontend

```bash
pnpm --filter frontend dev
# → http://localhost:3001
```

### Backend

```bash
pnpm --filter backend dev
# → http://localhost:3000/docs
```

### Build all packages

```bash
pnpm --filter './*' build
```

### Lint all packages

```bash
pnpm --filter './*' lint
```

---

## 🗂 Folder Summaries

### 🖥️ Frontend (`frontend/`)

A **Next.js** 16 application using the **App Router**.
Provides a modern UI for bill payment workflows.

**Key Features:**

* Modular component structure per bill category (airtime, data, TV, electricity)
* Type-safe Zod schemas
* Reusable UI components
* Integration with backend REST APIs

📘 Read more: [**Frontend README →**](./frontend/README.md)

---

### ⚙️ Backend (`backend/`)

A **NestJS** service responsible for:

* Payment validation and routing to providers
* Retry & reconciliation (BullMQ + Redis)
* Provider plan synchronization (Cron jobs)
* Prisma + PostgreSQL persistence
* Auto-generated Swagger documentation

📘 Read more: [**Backend README →**](./backend/README.md)

---

## 🧠 Development Workflow

Typical local setup:

```bash
# 1. Install all dependencies
pnpm install

# 2. Setup backend environment
cd backend && cp .env.example .env

# 3. Run database migrations
pnpm dlx prisma migrate dev

# 4. Run backend and frontend in separate terminals
pnpm --filter backend dev
pnpm --filter frontend dev
```

---

## 🔐 Environment Management

Each app defines its own `.env` file.
Keep sensitive credentials (DB_URL, API keys, secrets) **out of version control**.

Example backend `.env`:

```bash
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/billpay
REDIS_URL=redis://localhost:6379
INTERSWITCH_CLIENT_ID=...
VTPASS_API_KEY=...
```

---

## 🧪 Testing

### Backend

```bash
pnpm --filter backend test
```

### Frontend

```bash
pnpm --filter frontend test
```

(Adjust for your test runner: Jest, Vitest, or Playwright.)

---

## 🧱 Project Goals

* **Unified development** — Shared tooling across backend & frontend
* **Type safety** — End-to-end TypeScript
* **Scalability** — Clear separation of concerns
* **Resilience** — Retry & reconciliation for payment flows

---

## 🧭 Contributing

1. Create a new branch

   ```bash
   git checkout -b feat/your-feature
   ```

2. Run linter before committing

   ```bash
   pnpm lint
   ```

3. Follow [Conventional Commits](https://www.conventionalcommits.org/)

   ```bash
   feat: add electricity payment API
   ```

4. Open a PR with a clear, descriptive message.

---

## 🪪 License

Licensed under the **MIT License**.
See [LICENSE](./LICENSE) for more details.

---

## 📚 References

* [Frontend README](./frontend/README.md)
* [Backend README](./backend/README.md)
* [pnpm Workspace Docs](https://pnpm.io/workspaces)
* [NestJS Docs](https://docs.nestjs.com)
* [Next.js Docs](https://nextjs.org/docs)
* [Interswitch Docs](https://docs.interswitchgroup.com/docs/bills-payment-1)
* [VTPass Docs](https://www.vtpass.com/documentation/)

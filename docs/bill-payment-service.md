# 📲 Bill Payment Service

A modular bill payment system designed to integrate with providers such as **Interswitch**.  
It supports **airtime, data, TV, electricity, and gaming** bill payments, while maintaining a strong audit trail with **payment records and attempts**.

---

## 🚀 Features

- **Payment lifecycle management** (pending → processing → paid/failed)  
- **Provider integration** via `InterSwitchService`  
- **Biller plans & caching** for optimized customer experience  
- **Customer validation** before transaction initiation  
- **Robust retry & reconciliation** using `PaymentAttempt` model  
- **Extensible design** for multiple providers beyond Interswitch  

---

## 🗂️ Data Models

### `PaymentStatus` (Enum)

- `PENDING` → Payment created but not processed yet  
- `PROCESSING` → Payment is in-flight with a provider  
- `PAID` → Payment confirmed as successful  
- `FAILED` → Payment irrecoverable  

---

### `Provider`

Represents an upstream billing/payment provider.  

```prisma
id        String   @id @default(uuid())
name      String   @unique    // e.g. "interswitch"
active    Boolean  @default(true)
attempts  PaymentAttempt[]
```

---

### `PaymentRecord`

Represents a **unique bill payment request**.

- Tracks overall payment lifecycle
- Ensures **idempotency** via `requestReference`

**Key fields**

- `status` – high-level status (`PENDING`, `PAID`, etc)
- `amount` – stored in **minor units (kobo)**
- `customerId` – e.g., phone number, meter number, smartcard ID
- `paymentCode` – provider-specific service/payment code

---

### `PaymentAttempt`

Represents a **single attempt to process a payment** with a provider.

- Supports retries & multiple providers for redundancy
- Stores raw provider request/response for auditability

**Key fields**

- `providerStatus`, `lastError`, `confirmedTransaction`
- `isPrimary` → identifies main attempt
- Unique constraint prevents duplicate attempts for the same provider

---

### `BillerPlan`

Normalized representation of a **bill plan or product** (e.g., MTN 1GB daily, DSTV Compact, Ikeja Electric).

- Source-of-truth for customer-facing catalog
- Provider metadata stored in `providerMeta` array for multi-provider support

---

## 🔌 Services

### `InterSwitchService`

Handles direct integration with Interswitch API:

- **Auth & token management** with caching
- Fetching **biller categories, services, and payment items**
- **Customer validation** before payment
- **Payment execution** and transaction confirmation
- **Plan refresh** to sync supported billers & services

---

### `BillsService`

Orchestrates business logic for bill payments:

1. **Fetch plans** (with cache)
2. **Validate customer & amount rules**
3. **Create payment record + attempt**
4. **Confirm transaction status**
5. **Execute provider payment**
6. **Normalize results** into SUCCESS / PENDING / FAILED

---

## 🔄 Payment Flow

1. **Client requests a bill payment** with:

   - `customerId` (phone, meter, card number)
   - `paymentCode` (provider item code)
   - `amount`
   - `requestReference` (idempotent key)

2. **System checks for existing record** (idempotency)

3. **Customer validation** with provider

4. **Payment attempt created**

5. **Transaction confirmed** with provider (to avoid duplicates)

6. **Payment executed** via `pay()` API

7. **Result mapped** to SUCCESS / PENDING / FAILED

---

## ✅ Idempotency & Safety

- `requestReference` ensures **same transaction cannot be duplicated**
- PaymentRecord `status` enforces state machine rules:

  - Cannot retry failed transactions
  - Cannot reprocess already paid ones

---

## 🏗️ Extensibility

- Additional providers can be integrated by creating new services (e.g., `ProviderXService`) that follow the same interface as `InterSwitchService`
- `PaymentAttempt` supports multi-provider fallback (primary/fallback)

---

## 📌 TODOs

- [ ] Add support for **multi-provider fallback** (e.g., ProviderX if Interswitch fails)
- [ ] Implement **reconciliation job** for pending/failed transactions

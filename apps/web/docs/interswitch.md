# 🛒 Next.js + Interswitch Inline Checkout

This project integrates **Interswitch Inline Checkout** into a Next.js App Router project.  
It allows users to make payments seamlessly inside your app.

---

## ⚙️ Environment Variables

Copy `.env.example` into `.env.local`:

```bash
cp .env.example .env.local
````

Update with your own credentials:

```env
# .env.local
NEXT_PUBLIC_INTERSWITCH_MERCHANT_CODE=YOUR_MERCHANT_CODE
NEXT_PUBLIC_INTERSWITCH_PAY_ITEM_ID=YOUR_PAY_ITEM_ID
INTERSWITCH_SECRET_KEY=YOUR_SECRET_KEY
NODE_ENV=development
```

⚠️ **Do not commit `.env.local`** — keep your credentials private.

---

## 🔑 Generate Transaction Reference

We generate a unique `txnRef` for each payment:

```ts
import { randomUUID } from "crypto";

export function generateTxnRef(prefix = "myapp") {
  return `${prefix}_${randomUUID()}`;
}
```

---

## 🧪 Sandbox Test Cards [Interswitch Test Cards](https://docs.interswitchgroup.com/docs/test-cards)

Use these cards to simulate different payment scenarios in **TEST mode**:

| Card Brand | Card PAN            | Expiry | CVV | PIN  | OTP    | Scenario                                 |
| ---------- | ------------------- | ------ | --- | ---- | ------ | ---------------------------------------- |
| Verve      | 5061050254756707864 | 06/26  | 111 | 1111 |        | ✅ Success                                |
| Verve      | 5060990580000217499 | 03/50  | 111 | 1111 |        | ✅ Success                                |
| VISA       | 4000000000002503    | 03/50  | 11  | 1111 |        | ✅ Success                                |
| Mastercard | 5123450000000008    | 01/39  | 100 | 1111 | 123456 | ✅ Success                                |
| Verve      | 5061830100001895    | 01/40  | 111 | 1111 | 123456 | ❌ Failure – Timeout calling issuing bank |
| Verve      | 5060990580000000390 | 03/50  | 111 | 1111 | 123456 | ❌ Failure – Insufficient Funds           |
| Verve      | 5612330000000000412 | 03/50  | 111 | 1111 | 123456 | ❌ Failure – No Card Record               |

⚠️ These only work in `TEST` mode with the sandbox script.

---

## 🔐 Notes

* Always **verify payments on your backend** using Interswitch’s [transaction requery API](https://docs.interswitchgroup.com/docs/web-checkout).
* Never trust only the client’s `onComplete` response.
* Do not expose your **secret key** in frontend code.

---

## 🚀 Deployment

For production, switch the script and mode:

```tsx
<Script src="https://webpay.interswitchng.com/inline-checkout.js" strategy="afterInteractive" />
```

And set in `.env.local`:

```env
NODE_ENV=production
```

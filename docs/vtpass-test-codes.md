
# **VTpass Sandbox Testing Codes**

This document contains all **test numbers**, **smart-card numbers**, and **meter numbers** used to simulate different API responses on VTpass for Airtime, Data, Electricity, and TV Subscription.

---

## 📱 Airtime (MTN VTU)

**Endpoint:** MTN Airtime VTU API
**Documentation:** (VTpass Sandbox)

### 📺 **Test Numbers**

| Phone Number       | Result              |
| ------------------ | ------------------- |
| `08011111111`      | Success             |
| `201000000000`     | Pending             |
| `500000000000`     | Unexpected Response |
| `400000000000`     | No Response         |
| `300000000000`     | Timeout             |
| *Any other number* | Failed              |

---

## 🌐 Data (MTN Data)

**Endpoint:** MTN Data API
**Documentation:** (VTpass Sandbox)

### **Test Numbers**

| Phone Number       | Result              |
| ------------------ | ------------------- |
| `08011111111`      | Success             |
| `201000000000`     | Pending             |
| `500000000000`     | Unexpected Response |
| `400000000000`     | No Response         |
| `300000000000`     | Timeout             |
| *Any other number* | Failed              |

---

## ⚡ Electricity (IKEDC – Ikeja Electric)

**Endpoint:** IKEDC API
**Documentation:** (VTpass Sandbox)

### **Test Meter Numbers**

| Meter Number      | Customer Type | Result              |
| ----------------- | ------------- | ------------------- |
| `1111111111111`   | Prepaid       | Success             |
| `1010101010101`   | Postpaid      | Success             |
| `201000000000`    | —             | Pending             |
| `500000000000`    | —             | Unexpected Response |
| `400000000000`    | —             | No Response         |
| `300000000000`    | —             | Timeout             |
| *Any other meter* | —             | Failed              |

---

## ## 📺 TV (DSTV)

**Endpoint:** DSTV Subscription API
**Documentation:** (VTpass Sandbox)

### **Test Smartcard Numbers**

| Smartcard Number   | Result              |
| ------------------ | ------------------- |
| `1212121212`       | Success             |
| `201000000000`     | Pending             |
| `500000000000`     | Unexpected Response |
| `400000000000`     | No Response         |
| `300000000000`     | Timeout             |
| *Any other number* | Failed              |

---

## ## ✔ Summary Table

| Category    | Success Test                  | Pending      | Unexpected   | No Response  | Timeout      |
| ----------- | ----------------------------- | ------------ | ------------ | ------------ | ------------ |
| Airtime     | 08011111111                   | 201000000000 | 500000000000 | 400000000000 | 300000000000 |
| Data        | 08011111111                   | 201000000000 | 500000000000 | 400000000000 | 300000000000 |
| Electricity | 1111111111111 / 1010101010101 | 201000000000 | 500000000000 | 400000000000 | 300000000000 |
| TV          | 1212121212                    | 201000000000 | 500000000000 | 400000000000 | 300000000000 |


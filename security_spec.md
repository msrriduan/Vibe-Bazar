# Security Specification for Vibebazar

## 1. Data Invariants

- **Products**: Read-only for the public. Write actions (create, update, delete) are strictly limited to authenticated Admin users.
- **Categories**: Read-only for the public. Write actions are strictly limited to Admin users.
- **Orders**: Creation is allowed by anyone (guests can place checkout orders, a standard requirement for Bangladeshi eCommerce). Admin users have full listing, tracking, and modification access. Customers can fetch (`get`) a single order if they present the unique document ID (for tracking), but cannot list (`query/list`) all orders.
- **Coupons**: Guest readers can check custom coupon codes. Admin users have write permission.
- **Settings**: Read-only for public layout variables. Write access restricted to Admin.
- **Admins**: Admin email records can only be queried, written, or mutated by existing admins.

---

## 2. The "Dirty Dozen" Exploit Payloads

Here are the 12 specific exploit payloads representing attempts to break business logic, escalate privileges, or bypass validation. The security rules must block all of these with `PERMISSION_DENIED`.

### Exploit 1: Privilege Escalation - Self-Seeding Admin
An unauthorized guest attempts to insert themselves into the `/admins` collection to gain global superuser rights.
```json
// Path: /admins/unauthorized@attacker.com
{
  "email": "unauthorized@attacker.com",
  "createdAt": "2026-06-01T22:00:00Z"
}
```

### Exploit 2: Price Manipulation in eCommerce Grid
An malicious actor attempts to create a high-end leather jacket set with a forged price of 1 BDT instead of 5,000 BDT.
```json
// Path: /products/malicious_jacket
{
  "id": "malicious_jacket",
  "name": "Attacker Forged Leather Jacket",
  "category": "Men's Fashion",
  "price": 1,
  "stock": 100,
  "images": ["https://images.com/malicious.jpg"],
  "isCODEnabled": true,
  "codAllowedAreas": "all",
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```

### Exploit 3: State Shortcutting - Auto-Delivering Orders
An checkout shopper attempts to insert a custom order with `status` field preset to `"delivered"` and `paymentStatus` set to `"Confirmed"`, skipping payment verification and fulfillment phases entirely.
```json
// Path: /orders/forged_order_123
{
  "id": "forged_order_123",
  "customerName": "Attacker",
  "customerPhone": "01989475141",
  "customerAddress": "Attacker Hideout",
  "items": [],
  "paymentMethod": "COD",
  "paymentStatus": "Confirmed",
  "status": "delivered",
  "totalAmount": 100,
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```

### Exploit 4: Mass Query Scraping
An unauthenticated scraper sends a blanket query to fetch and dump list responses of all phone numbers, delivery addresses, and purchases stored under `/orders`.
```javascript
// Operation: Query/List "orders" collection
db.collection("orders").get(); // Must be blocked for all guests and non-admin logins
```

### Exploit 5: Denial of Wallet Structure Poisoning
An attacker attempts to bloat the database index storage by writing a product containing an unconstrained string key and a massive 2MB description field.
```json
// Path: /products/poison_payload
{
  "id": "poison_payload",
  "name": "Poison Product",
  "category": "Electronics",
  "price": 9999,
  "stock": 10,
  "images": [],
  "isCODEnabled": false,
  "description": "...[A 2 Megabyte String block here simulating massive storage attack]...",
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```

### Exploit 6: Unauthorized Setting Injection
A bad actor attempts to overwrite the official bKash merchant number to route checkout money to their own personal line.
```json
// Path: /settings/main
{
  "id": "main",
  "paymentNumbers": {
    "bKash": "01700000000", // Attacker's phone number
    "Nagad": "01800000000"
  },
  "whatsappNumber": "01700000000"
}
```

### Exploit 7: Coupon Forgery
An attacker attempts to create their own promo code `ATTACKER99` which offers a flat discount of 100,000 BDT to checkout cart.
```json
// Path: /coupons/ATTACKER99
{
  "code": "ATTACKER99",
  "discountType": "flat",
  "discountValue": 100000,
  "minOrderAmount": 0,
  "isActive": true,
  "createdAt": "request.time"
}
```

### Exploit 8: Unauthorized Category Destruction/Creation
A guest user attempts to delete a core listing category (`/categories/mens_fashion`) to crash the frontend dashboard.
```javascript
// Operation: Delete
db.collection("categories").doc("mens_fashion").delete();
```

### Exploit 9: Invalid Value Type Injection
An attacker attempts to bypass standard numbers logic by setting `totalAmount` of an order as a boolean `true`, hoping to trigger type issues in invoice parsing.
```json
// Path: /orders/type_exploit
{
  "id": "type_exploit",
  "customerName": "Bad Val",
  "customerPhone": "01989475141",
  "customerAddress": "Dhaka",
  "items": [],
  "paymentMethod": "bKash",
  "paymentStatus": "Pending",
  "status": "pending",
  "totalAmount": true, // Boolean instead of absolute positive number
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```

### Exploit 10: State Machine Violation (Terminal State Lock Override)
An order has already reached the terminal `"cancelled"` or `"delivered"` state. An attacker attempts to modify and revive the order to `"pending"` or `"confirmed"` from the client interface.
```javascript
// Operation: Update "status" on finished document
db.collection("orders").doc("already_cancelled").update({ status: "pending" });
```

### Exploit 11: Spoofed Server Timestamps
An attacker tries to post a product with a backdated `createdAt` timestamp to bypass sorting or spoof discount durations.
```json
// Path: /products/backdated_item
{
  "id": "backdated_item",
  "name": "Backdated Good",
  "category": "New Arrivals",
  "price": 1000,
  "stock": 5,
  "images": [],
  "isCODEnabled": true,
  "createdAt": "2020-01-01T00:00:00Z", // Backdated timestamp instead of request.time
  "updatedAt": "request.time"
}
```

### Exploit 12: Injection Attack on Document IDs
An attacker attempts to trigger database instability or index swelling by writing a product with a massive custom string containing illegal special symbols.
```javascript
// Operation: Write Product to path with malicious ID containing special chars and length > 200
db.collection("products").doc("malicious_id_!@#$%_".repeat(20)).set({ ... });
```

---

## 3. The Security Test Runner Mock Specification

Below is a TypeScript blueprint `firestore.rules.test.ts` representing the unit test verification of these rules.

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment
} from "@firebase/rules-unit-testing";

let testEnv: RulesTestEnvironment;

describe("Vibebazar Security Rules", () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "formal-adapter-87854",
      firestore: {
        rules: require("fs").readFileSync("firestore.rules", "utf8")
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it("should block Exploit 1: Self-Seeding Admin", async () => {
    const context = testEnv.unauthenticatedContext();
    const db = context.firestore();
    await assertFails(
      db.collection("admins").doc("unauthorized@attacker.com").set({
        email: "unauthorized@attacker.com",
        createdAt: new Date()
      })
    );
  });

  it("should block Exploit 2: Public Product price injection", async () => {
    const context = testEnv.unauthenticatedContext();
    await assertFails(
      context.firestore().collection("products").doc("malicious_jacket").set({
        id: "malicious_jacket",
        name: "Attacker Jacket",
        category: "Men's Fashion",
        price: 1,
        stock: 100,
        images: ["image.jpg"],
        isCODEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    );
  });

  it("should block Exploit 3: Forcing Order 'delivered' on Create", async () => {
    const context = testEnv.unauthenticatedContext();
    await assertFails(
      context.firestore().collection("orders").doc("forged_order").set({
        id: "forged_order",
        customerName: "Attacker",
        customerPhone: "01989475141",
        customerAddress: "Address",
        items: [],
        paymentMethod: "COD",
        paymentStatus: "Confirmed", // Forged
        status: "delivered", // Forged Status
        totalAmount: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    );
  });

  it("should enforce and pass happy paths for normal checkouts", async () => {
    const context = testEnv.unauthenticatedContext();
    await assertSucceeds(
      context.firestore().collection("orders").doc("happy_order").set({
        id: "happy_order",
        customerName: "Real Customer",
        customerPhone: "01977777777",
        customerAddress: "Dhaka, Bangladesh",
        items: [{ id: "prod1", name: "Shirt", price: 1000, quantity: 1 }],
        paymentMethod: "bKash",
        paymentStatus: "Pending",
        status: "pending",
        totalAmount: 1000,
        createdAt: new Date(), // Simulates request.time
        updatedAt: new Date()
      })
    );
  });
});
```

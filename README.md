# Entity Store Kit

A **lightweight, strongly‑typed state‑management toolkit for React + TypeScript**, built around `Map` for **O(1) lookups**, fine‑grained subscriptions, and **tree‑shakable ESM exports**.

This library is designed for **entity‑based state** (users, products, invoices, etc.) where fast access, predictable updates, and excellent TypeScript ergonomics matter.

---

## ✨ Features

- ⚡ **O(1) lookups** using `Map`
- 🧠 **Strong TypeScript typing** (including nested key paths)
- 🔌 **React bindings** via `useSyncExternalStore`
- 🌳 **Tree‑shakable** (ESM‑first design)
- 🧩 **Composable RootStore** for multi‑store apps
- 💾 **Serialization / hydration** support
- 🚫 No proxies, no reducers, no magic

---

## 📦 Installation

```bash
npm install entity-storekit
# or
pnpm add entity-storekit
# or
yarn add entity-storekit
```

---

## 🧱 Core Concepts

### 1. BaseStore

`BaseStore<T, K>` is a generic entity store:

- `T` → entity type
- `K` → **nested key path** used as the entity ID

Internally, entities are stored in a `Map`, giving:

- `get(id)` → O(1)
- `set(entity)` → O(1)
- `delete(id)` → O(1)

### Example

```ts
import { BaseStore } from "entity-storekit";

type User = {
  id: string;
  profile: {
    email: string;
  };
};

export const userStore = new BaseStore<User, "id">("id");
```

Nested keys are also supported:

```ts
new BaseStore<User, "profile.email">("profile.email");
```

TypeScript will **only allow valid paths**.

---

## 🧠 Store API

### CRUD Operations

```ts
store.set(entity);
store.setMany(entities);
store.get(id);
store.getAll();
store.update(id, partial);
store.delete(id);
store.clear();
```

### Utilities

```ts
store.has(id);
store.count();
```

---

## 🔔 Subscriptions

Each store supports subscriptions:

```ts
const unsubscribe = store.subscribe(() => {
  console.log("store changed");
});

unsubscribe();
```

Subscriptions are used internally for React re‑renders.

---

## ⚛️ React Integration

### `useStore`

A generic React hook that binds a `BaseStore` to React using `useSyncExternalStore`.

```ts
import { useStore } from "entity-storekit";

const users = useStore(userStore);
```

- Automatically re‑renders on store updates
- Fully concurrent‑mode safe
- No stale snapshots

---

## 🗂 RootStore (Multi‑Store Apps)

`RootStore` is a registry for multiple stores.

### Create a Root Store

```ts
import { RootStore } from "entity-storekit";

export const appRootStore = new RootStore();
```

### Register Stores

```ts
appRootStore.register("users", userStore);
```

### Access Stores

```ts
const users = appRootStore.getStore("users");
```

### Clear All Stores

```ts
appRootStore.clearAll();
```

---

## 🧬 RootStore Typing (Advanced)

You can globally augment the `RootStoreRegistry` interface to get **fully typed access**:

```ts
declare module "entity-storekit" {
  interface RootStoreRegistry {
    users: BaseStore<User, "id">;
  }
}
```

Now `getStore("users")` is strongly typed.

---

## 💾 Serialization & Hydration

### Serialize

```ts
const json = store.toJSON();
```

### Restore

```ts
store.fromJSON(json);
```

This makes the library ideal for:

- Persistence
- SSR hydration
- DevTools
- Time‑travel debugging

---

## 🌳 Tree‑Shaking

This package is **fully tree‑shakable**:

- ESM exports (`import` / `export`)
- No side effects at module scope
- Named exports only

Consumers only ship what they use.

---

## 🏎 Why `Map`?

Using `Map` instead of arrays or objects gives:

- Constant‑time lookups
- Stable iteration order
- Efficient deletes
- Clean serialization

Perfect for entity collections.

---

## 📁 Project Structure

```text
src/
  base-store.ts
  root-store.ts
  useStore.ts
  index.ts
dist/
  index.mjs
  index.js
  index.d.ts
```

---

## 🧪 Use Cases

- React entity state
- Client‑side caches
- Normalized data stores
- Admin dashboards
- Data‑heavy UIs

---

## 🛣 Roadmap

- DevTools integration
- Middleware support
- Computed selectors
- Persistence adapters

---

## 📜 License

MIT

---

## ❤️ Philosophy

> **Simple data structures. Explicit updates. Zero magic.**

Entity Store Kit is intentionally small, predictable, and TypeScript‑first.

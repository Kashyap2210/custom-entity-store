// src/root-store.ts
var RootStore = class {
  constructor() {
    this.stores = /* @__PURE__ */ new Map();
  }
  register(key, store) {
    this.stores.set(key, store);
  }
  getStore(key) {
    const store = this.stores.get(key);
    if (!store) {
      throw new Error(`Store '${String(key)}' not found`);
    }
    return store;
  }
  clearAll() {
    for (const store of this.stores.values()) store.clear();
  }
  toJSON() {
    const result = {};
    for (const [key, store] of this.stores)
      result[key] = store.toJSON();
    return result;
  }
  fromJSON(json) {
    for (const [key, data] of Object.entries(json)) {
      const store = this.stores.get(key);
      if (store) store.fromJSON(data);
    }
  }
};

// src/app-root-store.ts
var appRootStore = new RootStore();

// src/register-store.ts
function registerAllStores() {
}

// src/useStore.ts
import { useSyncExternalStore } from "use-sync-external-store/shim";
function useStore(store) {
  const lorem = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    // subscribe
    () => store.getAll()
    // snapshot getter
  );
  return lorem;
}

// src/base-store.ts
var BaseStore = class {
  constructor(keyPath) {
    this.data = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Set();
    // --- Cache for getAll() ---
    this.cachedArray = [];
    this.cacheDirty = true;
    this.keyPath = keyPath;
  }
  /**
   * Subscribe to store updates.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Emit updates to all subscribers.
   */
  emit() {
    this.cacheDirty = true;
    for (const listener of this.listeners) listener();
  }
  /**
   * Utility: get nested property value from object by path (e.g. "a.b.c").
   * Throws an error if any part of the path is invalid.
   */
  getKeyValue(obj) {
    const keys = this.keyPath.split(".");
    let current = obj;
    for (const key of keys) {
      if (current == null || !(key in current)) {
        throw new Error(
          `[BaseStore] Invalid key path "${this.keyPath}" \u2014 "${key}" does not exist on object.`
        );
      }
      current = current[key];
    }
    return current;
  }
  /**
   * Create or update a single entity.
   */
  set(entity) {
    const keyValue = this.getKeyValue(entity);
    if (keyValue === void 0) {
      console.warn(
        `[BaseStore] Could not find key "${this.keyPath}" in entity:`,
        entity
      );
      return;
    }
    this.data.set(keyValue, entity);
    this.emit();
  }
  /**
   * Create or update multiple entities at once.
   */
  setMany(entities) {
    if (!entities.length) return;
    for (const entity of entities) {
      const keyValue = this.getKeyValue(entity);
      if (keyValue !== void 0) this.data.set(keyValue, entity);
    }
    this.emit();
  }
  /**
   * Retrieve entity by key value.
   */
  get(keyValue) {
    return this.data.get(keyValue);
  }
  /**
   * Retrieve all entities as array.
   */
  getAll() {
    if (!this.cacheDirty) return this.cachedArray;
    this.cachedArray = Array.from(this.data.values());
    this.cacheDirty = false;
    return this.cachedArray;
  }
  /**
   * Delete an entity by key value.
   */
  delete(keyValue) {
    if (this.data.delete(keyValue)) this.emit();
  }
  /**
   * Update entity partially.
   */
  update(keyValue, partial) {
    const existing = this.data.get(keyValue);
    if (!existing) return;
    const updated = { ...existing, ...partial };
    this.data.set(keyValue, updated);
    this.emit();
  }
  /**
   * Clear the store.
   */
  clear() {
    if (this.data.size > 0) {
      this.data.clear();
      this.emit();
    }
  }
  /**
   * Check if entity exists by key value.
   */
  has(keyValue) {
    return this.data.has(keyValue);
  }
  /**
   * Count entities in the store.
   */
  count() {
    return this.data.size;
  }
  /**
   * Serialize the store to JSON.
   */
  toJSON() {
    return Array.from(this.data.entries());
  }
  /**
   * Restore the store from JSON.
   */
  fromJSON(json) {
    this.data = new Map(json);
    this.emit();
  }
};
export {
  BaseStore,
  RootStore,
  appRootStore,
  registerAllStores,
  useStore
};
//# sourceMappingURL=index.mjs.map
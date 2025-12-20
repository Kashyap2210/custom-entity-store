export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: T[K] extends object
        ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
        : `${K}`;
    }[keyof T & (string | number)]
  : never;

export type Listener = () => void;

/**
 * Generic, strongly-typed store for managing entities of type T.
 * Supports nested key paths like "billingEntity.id".
 */
export class BaseStore<T, K extends NestedKeyOf<T>> {
  protected data: Map<any, T> = new Map();
  private listeners: Set<Listener> = new Set();
  private readonly keyPath: K;

  // --- Cache for getAll() ---
  private cachedArray: T[] = [];
  private cacheDirty = true;

  constructor(keyPath: K) {
    this.keyPath = keyPath;
  }

  /**
   * Subscribe to store updates.
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit updates to all subscribers.
   */
  protected emit(): void {
    this.cacheDirty = true;
    for (const listener of this.listeners) listener();
  }

  /**
   * Utility: get nested property value from object by path (e.g. "a.b.c").
   * Throws an error if any part of the path is invalid.
   */
  private getKeyValue(obj: any): any {
    const keys = this.keyPath.split(".");
    let current = obj;

    for (const key of keys) {
      if (current == null || !(key in current)) {
        throw new Error(
          `[BaseStore] Invalid key path "${this.keyPath}" — "${key}" does not exist on object.`
        );
      }
      current = current[key];
    }

    return current;
  }

  /**
   * Create or update a single entity.
   */
  set(entity: T): void {
    const keyValue = this.getKeyValue(entity);
    if (keyValue === undefined) {
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
  setMany(entities: T[]): void {
    if (!entities.length) return;
    for (const entity of entities) {
      const keyValue = this.getKeyValue(entity);
      if (keyValue !== undefined) this.data.set(keyValue, entity);
    }
    this.emit();
  }

  /**
   * Retrieve entity by key value.
   */
  get(keyValue: any): T | undefined {
    return this.data.get(keyValue);
  }

  /**
   * Retrieve all entities as array.
   */
  getAll(): T[] {
    if (!this.cacheDirty) return this.cachedArray;
    this.cachedArray = Array.from(this.data.values());
    this.cacheDirty = false;
    return this.cachedArray;
  }

  /**
   * Delete an entity by key value.
   */
  delete(keyValue: any): void {
    if (this.data.delete(keyValue)) this.emit();
  }

  /**
   * Update entity partially.
   */
  update(keyValue: any, partial: Partial<T>): void {
    const existing = this.data.get(keyValue);
    if (!existing) return;
    const updated = { ...existing, ...partial };
    this.data.set(keyValue, updated);
    this.emit();
  }

  /**
   * Clear the store.
   */
  clear(): void {
    if (this.data.size > 0) {
      this.data.clear();
      this.emit();
    }
  }

  /**
   * Check if entity exists by key value.
   */
  has(keyValue: any): boolean {
    return this.data.has(keyValue);
  }

  /**
   * Count entities in the store.
   */
  count(): number {
    return this.data.size;
  }

  /**
   * Serialize the store to JSON.
   */
  toJSON(): [any, T][] {
    return Array.from(this.data.entries());
  }

  /**
   * Restore the store from JSON.
   */
  fromJSON(json: [any, T][]): void {
    this.data = new Map(json);
    this.emit();
  }
}

// export type Listener = () => void;

// /**
//  * Generic, strongly-typed store for managing entities of type T.
//  * Uses a Map keyed by T[K] (where K is the key property name).
//  */
// export class BaseStore<T, K extends keyof T> {
//   protected data: Map<T[K], T> = new Map();
//   private listeners: Set<Listener> = new Set();
//   private readonly key: K;

//   // --- New caching fields ---
//   private cachedArray: T[] = [];
//   private cacheDirty = true;

//   constructor(key: K) {
//     this.key = key;
//   }

//   /**
//    * Subscribe to state changes.
//    * Returns an unsubscribe function.
//    */
//   subscribe(listener: Listener): () => void {
//     this.listeners.add(listener);
//     return () => this.listeners.delete(listener);
//   }

//   /** Notify all subscribers of a state change. */
//   protected emit(): void {
//     // Mark cache as dirty and notify subscribers
//     this.cacheDirty = true;
//     for (const listener of this.listeners) {
//       listener();
//     }
//   }

//   /** Create or update an entity. */
//   set(entity: T): void {
//     const keyValue = entity[this.key];
//     this.data.set(keyValue, entity);
//     this.emit();
//   }

//   setMany(entities: T[]): void {
//     let changed = false;
//     for (const entity of entities) {
//       const keyValue = entity[this.key];
//       this.data.set(keyValue, entity);
//       changed = true;
//     }
//     if (changed) this.emit();
//   }

//   /** Get an entity by key value. */
//   get(keyValue: T[K]): T | undefined {
//     return this.data.get(keyValue);
//   }

//   /** Get all entities as an array. */
//   getAll(): T[] {
//     if (!this.cacheDirty) return this.cachedArray;
//     this.cachedArray = Array.from(this.data.values());
//     this.cacheDirty = false;
//     return this.cachedArray;
//   }

//   /** Delete an entity by key value. */
//   delete(keyValue: T[K]): void {
//     if (this.data.delete(keyValue)) {
//       this.emit();
//     }
//   }

//   update(keyValue: T[K], partial: Partial<T>): void {
//     const existing = this.data.get(keyValue);
//     if (!existing) return;

//     const updated = { ...existing, ...partial };
//     this.data.set(keyValue, updated);
//     this.emit();
//   }

//   /** Clear all entities. */
//   clear(): void {
//     if (this.data.size > 0) {
//       this.data.clear();
//       this.emit();
//     }
//   }

//   /** Check if an entity exists by key value. */
//   has(keyValue: T[K]): boolean {
//     return this.data.has(keyValue);
//   }

//   /** Number of entities in the store. */
//   count(): number {
//     return this.data.size;
//   }

//   /** Convert the store to a serializable structure. */
//   toJSON(): [T[K], T][] {
//     return Array.from(this.data.entries());
//   }

//   /** Restore store state from serialized data. */
//   fromJSON(json: [T[K], T][]): void {
//     this.data = new Map(json);
//     this.emit();
//   }
// }

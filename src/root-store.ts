import { BaseStore } from "./base-store";

/**
 * Fully generic RootStore compatible with BaseStore<T, K>.
 */
export class RootStore<
  Stores extends Record<string, BaseStore<any, any>> = {}
> {
  private stores = new Map<keyof Stores & string, BaseStore<any, any>>();

  register<Key extends keyof RootStoreRegistry>(
    key: Key,
    store: RootStoreRegistry[Key]
  ): void {
    this.stores.set(key as string, store);
  }

  getStore<Key extends keyof RootStoreRegistry>(
    key: Key
  ): RootStoreRegistry[Key] {
    const store = this.stores.get(key as string);
    if (!store) {
      throw new Error(`Store '${String(key)}' not found`);
    }
    return store as RootStoreRegistry[Key];
  }

  clearAll(): void {
    for (const store of this.stores.values()) store.clear();
  }

  toJSON(): { [K in keyof Stores]: ReturnType<Stores[K]["toJSON"]> } {
    const result = {} as {
      [K in keyof Stores]: ReturnType<Stores[K]["toJSON"]>;
    };
    for (const [key, store] of this.stores)
      (result as any)[key] = store.toJSON();
    return result;
  }

  fromJSON(json: {
    [K in keyof Stores]: Parameters<Stores[K]["fromJSON"]>[0];
  }): void {
    for (const [key, data] of Object.entries(json)) {
      const store = this.stores.get(key as keyof Stores & string);
      if (store) (store as any).fromJSON(data);
    }
  }
}

export interface RootStoreRegistry {}

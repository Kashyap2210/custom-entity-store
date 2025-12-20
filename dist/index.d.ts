type NestedKeyOf<T> = T extends object ? {
    [K in keyof T & (string | number)]: T[K] extends object ? `${K}` | `${K}.${NestedKeyOf<T[K]>}` : `${K}`;
}[keyof T & (string | number)] : never;
type Listener = () => void;
/**
 * Generic, strongly-typed store for managing entities of type T.
 * Supports nested key paths like "billingEntity.id".
 */
declare class BaseStore<T, K extends NestedKeyOf<T>> {
    protected data: Map<any, T>;
    private listeners;
    private readonly keyPath;
    private cachedArray;
    private cacheDirty;
    constructor(keyPath: K);
    /**
     * Subscribe to store updates.
     */
    subscribe(listener: Listener): () => void;
    /**
     * Emit updates to all subscribers.
     */
    protected emit(): void;
    /**
     * Utility: get nested property value from object by path (e.g. "a.b.c").
     * Throws an error if any part of the path is invalid.
     */
    private getKeyValue;
    /**
     * Create or update a single entity.
     */
    set(entity: T): void;
    /**
     * Create or update multiple entities at once.
     */
    setMany(entities: T[]): void;
    /**
     * Retrieve entity by key value.
     */
    get(keyValue: any): T | undefined;
    /**
     * Retrieve all entities as array.
     */
    getAll(): T[];
    /**
     * Delete an entity by key value.
     */
    delete(keyValue: any): void;
    /**
     * Update entity partially.
     */
    update(keyValue: any, partial: Partial<T>): void;
    /**
     * Clear the store.
     */
    clear(): void;
    /**
     * Check if entity exists by key value.
     */
    has(keyValue: any): boolean;
    /**
     * Count entities in the store.
     */
    count(): number;
    /**
     * Serialize the store to JSON.
     */
    toJSON(): [any, T][];
    /**
     * Restore the store from JSON.
     */
    fromJSON(json: [any, T][]): void;
}

/**
 * Fully generic RootStore compatible with BaseStore<T, K>.
 */
declare class RootStore<Stores extends Record<string, BaseStore<any, any>> = {}> {
    private stores;
    register<Key extends keyof RootStoreRegistry>(key: Key, store: RootStoreRegistry[Key]): void;
    getStore<Key extends keyof RootStoreRegistry>(key: Key): RootStoreRegistry[Key];
    clearAll(): void;
    toJSON(): {
        [K in keyof Stores]: ReturnType<Stores[K]["toJSON"]>;
    };
    fromJSON(json: {
        [K in keyof Stores]: Parameters<Stores[K]["fromJSON"]>[0];
    }): void;
}
interface RootStoreRegistry {
}

declare const appRootStore: RootStore;

declare function registerAllStores(): void;

/**
 * Generic React hook to bind a BaseStore to React re-renders.
 */
declare function useStore<T, K extends NestedKeyOf<T>>(store: BaseStore<T, K>): T[];

export { BaseStore, type Listener, type NestedKeyOf, RootStore, type RootStoreRegistry, appRootStore, registerAllStores, useStore };

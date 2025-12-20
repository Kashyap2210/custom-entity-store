import { useSyncExternalStore } from "react";
import type { BaseStore, NestedKeyOf } from "./base-store";

/**
 * Generic React hook to bind a BaseStore to React re-renders.
 */
export function useStore<T, K extends NestedKeyOf<T>>(
  store: BaseStore<T, K>
): T[] {
  const lorem = useSyncExternalStore(
    (listener) => store.subscribe(listener), // subscribe
    () => store.getAll() // snapshot getter
  );
  // console.log("useStore snapshot:", store.getAll());
  return lorem;
}

// import { useEffect } from "react";
// import { appRootStore } from "../custom-state-store/app-root-store";
// import { EntityList } from "invoice-system-common";
// import { useStore } from "./useStore";

// export function useEntityData<T>(
//   entity: EntityList,
//   service: { search: (token: string) => Promise<T[]> },
//   accessToken: string
// ): T[] {
//   const store = appRootStore.getStore(entity as keyof RootStoreRegistry);
//   const data = useStore(store);

//   useEffect(() => {
//     if (data.length === 0) {
//       const fetchData = async () => {
//         try {
//           const fetched = await service.search(accessToken, {});
//           store.setMany(fetched);
//         } catch (error) {
//           console.error(`Failed to load ${entity}:`, error);
//         }
//       };
//       fetchData();
//     }
//   }, [data.length, accessToken, store, entity, service]);

//   return data;
// }

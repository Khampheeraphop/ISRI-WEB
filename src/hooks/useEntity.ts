import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  entityStore,
  type EntityMap,
  type EntityName,
} from "../mock/entityStore";

export const entityKeys = { all: (entity: EntityName) => [entity] as const };

export function useEntityQuery<K extends EntityName>(entity: K) {
  return useQuery({
    queryKey: entityKeys.all(entity),
    queryFn: () => entityStore.list(entity),
  });
}

export function useEntityMutation<K extends EntityName>(entity: K) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Parameters<typeof entityStore.create<K>>[1]) =>
      entityStore.create(entity, values),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: entityKeys.all(entity) }),
  });
}

export function useEntityUpdateMutation<K extends EntityName>(entity: K) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<EntityMap[K]>;
    }) => entityStore.update(entity, id, changes),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: entityKeys.all(entity) }),
  });
}

export function useEntityDeleteMutation<K extends EntityName>(entity: K) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entityStore.remove(entity, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: entityKeys.all(entity) }),
  });
}

export function useRewardRedemptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      rewardItemId,
    }: {
      userId: string;
      rewardItemId: string;
    }) => entityStore.redeemReward(userId, rewardItemId),
    onSuccess: () =>
      Promise.all(
        (
          [
            "pointWallets",
            "pointTransactions",
            "rewardItems",
            "rewardRedemptions",
          ] as const
        ).map((entity) =>
          queryClient.invalidateQueries({ queryKey: entityKeys.all(entity) }),
        ),
      ),
  });
}

export function useCompleteWorkOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workOrderId: string) =>
      entityStore.completeWorkOrder(workOrderId),
    onSuccess: () =>
      Promise.all(
        (
          [
            "workOrders",
            "incidents",
            "pointWallets",
            "pointTransactions",
          ] as const
        ).map((entity) =>
          queryClient.invalidateQueries({ queryKey: entityKeys.all(entity) }),
        ),
      ),
  });
}

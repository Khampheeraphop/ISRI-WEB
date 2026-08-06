import {
  useCompleteWorkOrderMutation,
  useEntityQuery,
  useEntityUpdateMutation,
} from "../../hooks/useEntity";
import type { WorkOrderStatus } from "../../types/workOrder";

export function useWorkOrderActions() {
  const workOrders = useEntityQuery("workOrders");
  const updateWorkOrder = useEntityUpdateMutation("workOrders");
  const completeWorkOrder = useCompleteWorkOrderMutation();

  const changeStatus = async (id: string, status: WorkOrderStatus) => {
    const workOrder = workOrders.data?.find((item) => item.id === id);
    if (!workOrder) return;
    if (status === "done") {
      await completeWorkOrder.mutateAsync(id);
      return;
    }
    await updateWorkOrder.mutateAsync({
      id,
      changes: {
        status,
        statusHistory: [
          ...workOrder.statusHistory,
          { status, changedAt: new Date().toISOString() },
        ],
      },
    });
  };

  const saveRepairPhotos = (id: string, files: File[]) =>
    updateWorkOrder.mutateAsync({
      id,
      changes: { repairPhotoUrls: files.map((file) => file.name) },
    });

  return {
    workOrders,
    changeStatus,
    saveRepairPhotos,
    isUpdating: updateWorkOrder.isPending || completeWorkOrder.isPending,
  };
}

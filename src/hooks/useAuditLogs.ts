import { useQuery } from "@tanstack/react-query";
import { csvApi, AuditLogResponse } from "../services/api";

// Hook for fetching audit logs
export const useAuditLogs = (
  page: number = 1,
  limit: number = 100,
  action?: string,
  rowId?: number
) => {
  return useQuery({
    queryKey: ["auditLogs", page, limit, action, rowId],
    queryFn: () => csvApi.getAuditLogs(page, limit, action, rowId),
    select: (response): AuditLogResponse => response.data,
  });
};

import { ActivityLogService } from "../application/services/ActivityLogService.js";
import { ActivityLogRepository } from "../infrastructure/repositories/ActivityLogRepository.js";

const activityLogRepository = new ActivityLogRepository();
const activityLogService = new ActivityLogService(activityLogRepository);

export interface AuditLogData {
  userId?: string | null;
  type: string;
  content: string;
  target?: string;
  ipAddress?: string;
  meta?: {
    action?: string;
    entity?: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
    [key: string]: any;
  };
}

/**
 * Helper function to log audit activities
 * Usage: await auditLogger.log({ userId, type: 'personnel_change', content: '...', ... })
 */
export const auditLogger = {
  log: async (data: AuditLogData): Promise<void> => {
    try {
      await activityLogService.logActivity({
        user_id: data.userId || null,
        type: data.type,
        content: data.content,
        target: data.target,
        ip_address: data.ipAddress,
        meta: data.meta,
      });
    } catch (error) {
      // Don't throw error if logging fails, just log to console
      console.error("Failed to write audit log:", error);
    }
  },

  // Convenience methods for common actions
  logUserCreate: async (userId: string | null, targetUserId: string, userName: string, ipAddress?: string) => {
    await auditLogger.log({
      userId,
      type: "personnel_change",
      content: `Tạo nhân viên mới: ${userName}`,
      target: userName,
      ipAddress,
      meta: {
        action: "create",
        entity: "user",
        entityId: targetUserId,
      },
    });
  },

  logUserUpdate: async (userId: string | null, targetUserId: string, userName: string, changes: any, ipAddress?: string) => {
    await auditLogger.log({
      userId,
      type: "personnel_change",
      content: `Cập nhật thông tin nhân viên: ${userName}`,
      target: userName,
      ipAddress,
      meta: {
        action: "update",
        entity: "user",
        entityId: targetUserId,
        changes,
      },
    });
  },

  logUserDelete: async (userId: string | null, targetUserId: string, userName: string, ipAddress?: string) => {
    await auditLogger.log({
      userId,
      type: "personnel_change",
      content: `Xóa nhân viên: ${userName}`,
      target: userName,
      ipAddress,
      meta: {
        action: "delete",
        entity: "user",
        entityId: targetUserId,
      },
    });
  },

  logDepartmentCreate: async (userId: string | null, deptId: string, deptName: string, ipAddress?: string) => {
    await auditLogger.log({
      userId,
      type: "system",
      content: `Tạo phòng ban mới: ${deptName}`,
      target: deptName,
      ipAddress,
      meta: {
        action: "create",
        entity: "department",
        entityId: deptId,
      },
    });
  },

  logDepartmentUpdate: async (userId: string | null, deptId: string, deptName: string, changes: any, ipAddress?: string) => {
    await auditLogger.log({
      userId,
      type: "system",
      content: `Cập nhật phòng ban: ${deptName}`,
      target: deptName,
      ipAddress,
      meta: {
        action: "update",
        entity: "department",
        entityId: deptId,
        changes,
      },
    });
  },

  logDepartmentDelete: async (userId: string | null, deptId: string, deptName: string, ipAddress?: string) => {
    await auditLogger.log({
      userId,
      type: "system",
      content: `Xóa phòng ban: ${deptName}`,
      target: deptName,
      ipAddress,
      meta: {
        action: "delete",
        entity: "department",
        entityId: deptId,
      },
    });
  },
};


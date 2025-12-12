/**
 * Alert Scheduler Service
 * Kiểm tra các điều kiện cảnh báo định kỳ và gửi thông báo
 */

import { dbPool } from "../../infrastructure/database/connection.js";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { enhancedNotificationService } from "./EnhancedNotificationService.js";

interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  category: "HR" | "System" | "Security";
  threshold: number;
  unit: "days" | "percent" | "count";
  notify_roles: string[];
  is_enabled: boolean;
}

interface AlertTrigger {
  ruleId: string;
  ruleName: string;
  category: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  affectedItems: Array<{ id: string; name: string; detail: string }>;
}

export class AlertSchedulerService {
  private db = dbPool;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Khởi động scheduler - chạy mỗi giờ
   */
  start(intervalMs: number = 60 * 60 * 1000) {
    if (this.isRunning) {
      console.log("⚠️ Alert scheduler is already running");
      return;
    }

    console.log("🔔 Starting Alert Scheduler Service...");
    this.isRunning = true;

    // Chạy ngay lập tức lần đầu
    this.checkAllRules();

    // Sau đó chạy định kỳ
    this.intervalId = setInterval(() => {
      this.checkAllRules();
    }, intervalMs);

    console.log(
      `✅ Alert scheduler started - checking every ${
        intervalMs / 1000 / 60
      } minutes`
    );
  }

  /**
   * Dừng scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("🛑 Alert scheduler stopped");
  }

  /**
   * Kiểm tra tất cả rules đang enabled
   */
  async checkAllRules(): Promise<void> {
    console.log(`🔍 [${new Date().toISOString()}] Checking alert rules...`);

    try {
      const [rules] = await this.db.query<RowDataPacket[]>(
        `SELECT * FROM alert_rules WHERE is_enabled = TRUE`
      );

      for (const rule of rules) {
        const parsedRule = this.parseRule(rule);
        await this.checkRule(parsedRule);
      }

      console.log(`✅ Checked ${rules.length} alert rules`);
    } catch (error) {
      console.error("❌ Error checking alert rules:", error);
    }
  }

  /**
   * Parse rule từ database
   */
  private parseRule(row: RowDataPacket): AlertRule {
    let notifyRoles: string[] = [];
    if (row.notify_roles) {
      if (Array.isArray(row.notify_roles)) {
        notifyRoles = row.notify_roles;
      } else if (typeof row.notify_roles === "string") {
        if (row.notify_roles.startsWith("[")) {
          try {
            notifyRoles = JSON.parse(row.notify_roles);
          } catch {
            notifyRoles = [];
          }
        } else {
          notifyRoles = row.notify_roles
            .split(",")
            .map((s: string) => s.trim());
        }
      }
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      threshold: row.threshold,
      unit: row.unit,
      notify_roles: notifyRoles,
      is_enabled: Boolean(row.is_enabled),
    };
  }

  /**
   * Kiểm tra một rule cụ thể
   */
  private async checkRule(rule: AlertRule): Promise<void> {
    try {
      const trigger = await this.evaluateRule(rule);
      if (trigger && trigger.affectedItems.length > 0) {
        await this.sendAlert(trigger, rule.notify_roles);
      }
    } catch (error) {
      console.error(`Error checking rule "${rule.name}":`, error);
    }
  }

  /**
   * Đánh giá điều kiện của rule
   */
  private async evaluateRule(rule: AlertRule): Promise<AlertTrigger | null> {
    const ruleName = rule.name.toLowerCase();

    // HR Rules
    if (ruleName.includes("hợp đồng") || ruleName.includes("contract")) {
      return this.checkContractExpiry(rule);
    }
    if (ruleName.includes("sinh nhật") || ruleName.includes("birthday")) {
      return this.checkUpcomingBirthdays(rule);
    }
    if (ruleName.includes("nghỉ phép") || ruleName.includes("leave")) {
      return this.checkLongLeave(rule);
    }
    if (ruleName.includes("onboarding") || ruleName.includes("nhân viên mới")) {
      return this.checkNewEmployeeOnboarding(rule);
    }

    // System Rules
    if (ruleName.includes("quá hạn") || ruleName.includes("overdue")) {
      return this.checkOverdueTasks(rule);
    }
    if (ruleName.includes("dự án") && ruleName.includes("trễ")) {
      return this.checkProjectDelay(rule);
    }
    if (ruleName.includes("đặt phòng") || ruleName.includes("booking")) {
      return this.checkUnconfirmedBookings(rule);
    }
    if (ruleName.includes("deadline") || ruleName.includes("hạn chót")) {
      return this.checkProjectDeadlines(rule);
    }

    // Security Rules
    if (ruleName.includes("đăng nhập") || ruleName.includes("login")) {
      return this.checkFailedLogins(rule);
    }
    if (ruleName.includes("phân quyền") || ruleName.includes("permission")) {
      return this.checkPermissionChanges(rule);
    }

    return null;
  }

  // ==================== HR CHECKS ====================

  /**
   * Kiểm tra hợp đồng sắp hết hạn
   */
  private async checkContractExpiry(
    rule: AlertRule
  ): Promise<AlertTrigger | null> {
    // Hiện tại table users chưa có contract_end_date, trả về null
    // TODO: Thêm field contract_end_date vào users nếu cần
    console.log("⚠️ Contract expiry check skipped - field not in schema");
    return null;
    /*
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT u.id, u.full_name, u.contract_end_date,
              DATEDIFF(u.contract_end_date, CURDATE()) as days_remaining
       FROM users u
       WHERE u.contract_end_date IS NOT NULL
         AND u.contract_end_date > CURDATE()
         AND DATEDIFF(u.contract_end_date, CURDATE()) <= ?
         AND u.status = 'Active'
         AND u.deleted_at IS NULL
       ORDER BY u.contract_end_date ASC`,
      [rule.threshold]
    );

    if (rows.length === 0) return null;

    */
  }

  /**
   * Kiểm tra sinh nhật sắp tới
   */
  private async checkUpcomingBirthdays(
    rule: AlertRule
  ): Promise<AlertTrigger | null> {
    // Hiện tại table users chưa có date_of_birth, trả về null
    console.log("⚠️ Birthday check skipped - field not in schema");
    return null;
    /*
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT u.id, u.full_name, u.date_of_birth,
              DATEDIFF(
                DATE_ADD(u.date_of_birth, 
                  INTERVAL YEAR(CURDATE()) - YEAR(u.date_of_birth) + 
                  IF(DAYOFYEAR(CURDATE()) > DAYOFYEAR(u.date_of_birth), 1, 0) YEAR),
                CURDATE()
              ) as days_until
       FROM users u
       WHERE u.date_of_birth IS NOT NULL
         AND u.status = 'Active'
         AND u.deleted_at IS NULL
       HAVING days_until >= 0 AND days_until <= ?
       ORDER BY days_until ASC`,
      [rule.threshold]
    );

    if (rows.length === 0) return null;

    */
  }

  /**
   * Kiểm tra nhân viên nghỉ phép dài
   */
  private async checkLongLeave(rule: AlertRule): Promise<AlertTrigger | null> {
    // Hiện tại chưa có table leave_requests, trả về null
    console.log("⚠️ Long leave check skipped - table not in schema");
    return null;
    /*
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT lr.id, u.full_name, lr.start_date, lr.end_date,
              DATEDIFF(lr.end_date, lr.start_date) + 1 as leave_days
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       WHERE lr.status = 'approved'
         AND lr.start_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
         AND lr.end_date >= CURDATE()
         AND DATEDIFF(lr.end_date, lr.start_date) + 1 >= ?
       ORDER BY lr.start_date ASC`,
      [rule.threshold]
    );

    if (rows.length === 0) return null;

    */
  }

  /**
   * Kiểm tra nhân viên mới cần onboarding
   */
  private async checkNewEmployeeOnboarding(
    rule: AlertRule
  ): Promise<AlertTrigger | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT u.id, u.full_name, u.join_date,
              DATEDIFF(CURDATE(), u.join_date) as days_since_hire
       FROM users u
       WHERE u.join_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         AND u.status = 'Active'
         AND u.deleted_at IS NULL
       ORDER BY u.join_date DESC`,
      [rule.threshold]
    );

    if (rows.length === 0) return null;

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      priority: "normal",
      message: `Có ${rows.length} nhân viên mới cần theo dõi onboarding (trong ${rule.threshold} ngày qua)`,
      affectedItems: rows.map((r) => ({
        id: r.id,
        name: r.full_name,
        detail: `Ngày vào: ${new Date(r.join_date).toLocaleDateString(
          "vi-VN"
        )} (${r.days_since_hire} ngày trước)`,
      })),
    };
  }

  // ==================== SYSTEM CHECKS ====================

  /**
   * Kiểm tra task quá hạn
   */
  private async checkOverdueTasks(
    rule: AlertRule
  ): Promise<AlertTrigger | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT t.id, t.title, t.due_date, p.name as project_name,
              DATEDIFF(CURDATE(), t.due_date) as days_overdue
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.status != 'completed'
         AND t.due_date < DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY t.due_date ASC
       LIMIT 50`,
      [rule.threshold]
    );

    if (rows.length === 0) return null;

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      priority: rows.some((r) => r.days_overdue > 7) ? "high" : "normal",
      message: `Có ${rows.length} công việc đã quá hạn`,
      affectedItems: rows.map((r) => ({
        id: r.id,
        name: r.title,
        detail: `Quá hạn ${r.days_overdue} ngày${
          r.project_name ? ` (${r.project_name})` : ""
        }`,
      })),
    };
  }

  /**
   * Kiểm tra dự án bị trễ tiến độ
   */
  private async checkProjectDelay(
    rule: AlertRule
  ): Promise<AlertTrigger | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT p.id, p.name, p.progress, p.end_date,
              DATEDIFF(p.end_date, p.start_date) as total_days,
              DATEDIFF(CURDATE(), p.start_date) as elapsed_days
       FROM projects p
       WHERE p.status = 'in_progress'
         AND p.start_date IS NOT NULL
         AND p.end_date IS NOT NULL
         AND p.end_date > CURDATE()
       HAVING elapsed_days > 0 
         AND (elapsed_days / total_days * 100) - p.progress >= ?`,
      [rule.threshold]
    );

    if (rows.length === 0) return null;

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      priority: "high",
      message: `Có ${rows.length} dự án đang chậm tiến độ (≥${rule.threshold}%)`,
      affectedItems: rows.map((r) => ({
        id: r.id,
        name: r.name,
        detail: `Tiến độ: ${r.progress}% (Thời gian đã qua: ${Math.round(
          (r.elapsed_days / r.total_days) * 100
        )}%)`,
      })),
    };
  }

  /**
   * Kiểm tra đặt phòng chưa xác nhận
   */
  private async checkUnconfirmedBookings(
    rule: AlertRule
  ): Promise<AlertTrigger | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT rb.id, r.name as room_name, rb.start_time, u.full_name,
              TIMESTAMPDIFF(HOUR, rb.created_at, NOW()) as hours_pending
       FROM room_bookings rb
       JOIN rooms r ON rb.room_id = r.id
       JOIN users u ON rb.booked_by = u.id
       WHERE rb.status = 'pending'
         AND rb.start_time > NOW()
         AND TIMESTAMPDIFF(DAY, rb.created_at, NOW()) >= ?
       ORDER BY rb.start_time ASC`,
      [rule.threshold]
    );

    if (rows.length === 0) return null;

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      priority: "normal",
      message: `Có ${rows.length} đặt phòng chưa được xác nhận (≥${rule.threshold} ngày)`,
      affectedItems: rows.map((r) => ({
        id: r.id,
        name: r.room_name,
        detail: `Đặt bởi ${r.full_name} - ${new Date(
          r.start_time
        ).toLocaleString("vi-VN")}`,
      })),
    };
  }

  /**
   * Kiểm tra deadline dự án sắp tới
   */
  private async checkProjectDeadlines(
    rule: AlertRule
  ): Promise<AlertTrigger | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT p.id, p.name, p.end_date, p.progress,
              DATEDIFF(p.end_date, CURDATE()) as days_remaining
       FROM projects p
       WHERE p.status = 'in_progress'
         AND p.end_date IS NOT NULL
         AND DATEDIFF(p.end_date, CURDATE()) BETWEEN 0 AND ?
       ORDER BY p.end_date ASC`,
      [rule.threshold]
    );

    if (rows.length === 0) return null;

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      priority: rows.some((r) => r.days_remaining <= 1) ? "urgent" : "high",
      message: `Có ${rows.length} dự án sắp đến deadline (trong ${rule.threshold} ngày)`,
      affectedItems: rows.map((r) => ({
        id: r.id,
        name: r.name,
        detail: `Còn ${r.days_remaining} ngày - Tiến độ: ${r.progress}%`,
      })),
    };
  }

  // ==================== SECURITY CHECKS ====================

  /**
   * Kiểm tra đăng nhập thất bại nhiều lần
   */
  private async checkFailedLogins(
    rule: AlertRule
  ): Promise<AlertTrigger | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT al.actor_id, u.full_name, u.email, COUNT(*) as failed_count,
              MAX(al.created_at) as last_attempt
       FROM activity_logs al
       LEFT JOIN users u ON al.actor_id = u.id
       WHERE al.action = 'LOGIN_FAILED'
         AND al.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       GROUP BY al.actor_id, u.full_name, u.email
       HAVING failed_count >= ?
       ORDER BY failed_count DESC`,
      [rule.threshold]
    );

    if (rows.length === 0) return null;

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      priority: "urgent",
      message: `Phát hiện ${rows.length} tài khoản có đăng nhập thất bại bất thường`,
      affectedItems: rows.map((r) => ({
        id: r.actor_id || "unknown",
        name: r.full_name || r.email || "Unknown",
        detail: `${r.failed_count} lần thất bại - Lần cuối: ${new Date(
          r.last_attempt
        ).toLocaleString("vi-VN")}`,
      })),
    };
  }

  /**
   * Kiểm tra thay đổi phân quyền
   */
  private async checkPermissionChanges(
    rule: AlertRule
  ): Promise<AlertTrigger | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT al.id, al.description, al.created_at, u.full_name as actor_name
       FROM activity_logs al
       LEFT JOIN users u ON al.actor_id = u.id
       WHERE al.action IN ('PERMISSION_CHANGE', 'ROLE_CHANGE', 'USER_ROLE_UPDATE')
         AND al.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY al.created_at DESC
       LIMIT ?`,
      [rule.threshold]
    );

    if (rows.length === 0) return null;

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      priority: "high",
      message: `Có ${rows.length} thay đổi phân quyền trong 24h qua`,
      affectedItems: rows.map((r) => ({
        id: r.id,
        name: r.actor_name || "System",
        detail: `${r.description} - ${new Date(r.created_at).toLocaleString(
          "vi-VN"
        )}`,
      })),
    };
  }

  // ==================== SEND ALERTS ====================

  /**
   * Gửi cảnh báo đến người dùng theo role
   */
  private async sendAlert(
    trigger: AlertTrigger,
    notifyRoles: string[]
  ): Promise<void> {
    // Tìm người dùng theo role
    const [users] = await this.db.query<RowDataPacket[]>(
      `SELECT DISTINCT u.id, u.full_name, u.role
       FROM users u
       WHERE u.role IN (?)
         AND u.status = 'Active'
         AND u.deleted_at IS NULL`,
      [notifyRoles]
    );

    if (users.length === 0) {
      console.log(`No users found for roles: ${notifyRoles.join(", ")}`);
      return;
    }

    // Kiểm tra xem đã gửi alert này trong 24h chưa (tránh spam)
    const [existing] = await this.db.query<RowDataPacket[]>(
      `SELECT id FROM notifications 
       WHERE type = 'system_alert'
         AND related_id = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       LIMIT 1`,
      [trigger.ruleId]
    );

    if ((existing as RowDataPacket[]).length > 0) {
      console.log(
        `Alert for rule "${trigger.ruleName}" already sent within 24h, skipping`
      );
      return;
    }

    // Tạo message chi tiết
    const detailList = trigger.affectedItems
      .slice(0, 5)
      .map((item) => `• ${item.name}: ${item.detail}`)
      .join("\n");

    const fullMessage =
      trigger.affectedItems.length > 5
        ? `${trigger.message}\n\n${detailList}\n... và ${
            trigger.affectedItems.length - 5
          } mục khác`
        : `${trigger.message}\n\n${detailList}`;

    // Gửi notification cho từng user
    for (const user of users) {
      await enhancedNotificationService.notifyUser({
        userId: user.id,
        title: `⚠️ ${trigger.ruleName}`,
        message: fullMessage,
        type: "system_alert",
        category: trigger.category.toLowerCase(),
        priority: trigger.priority,
        relatedId: trigger.ruleId,
        link: `/admin/alert-manager`,
      });
    }

    // Log alert đã được gửi
    await this.db.query<ResultSetHeader>(
      `INSERT INTO alert_history (id, rule_id, message, priority, affected_count, notified_users)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        trigger.ruleId,
        trigger.message,
        trigger.priority,
        trigger.affectedItems.length,
        JSON.stringify(users.map((u) => u.id)),
      ]
    );

    console.log(
      `✉️ Alert "${trigger.ruleName}" sent to ${
        users.length
      } users (${notifyRoles.join(", ")})`
    );
  }

  /**
   * Chạy kiểm tra thủ công một rule
   */
  async testRule(ruleId: string): Promise<AlertTrigger | null> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT * FROM alert_rules WHERE id = ?`,
      [ruleId]
    );

    if (rows.length === 0) return null;

    const rule = this.parseRule(rows[0]);
    return this.evaluateRule(rule);
  }
}

// Export singleton instance
export const alertSchedulerService = new AlertSchedulerService();

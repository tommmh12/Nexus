import { Request, Response } from "express";
import { AlertRuleRepository } from "../../infrastructure/repositories/AlertRuleRepository.js";

const alertRuleRepository = new AlertRuleRepository();

export const getAlertRules = async (req: Request, res: Response) => {
  try {
    // Seed default rules if empty
    await alertRuleRepository.seedDefaultRules();

    const rules = await alertRuleRepository.findAll();
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error("Error getting alert rules:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách cảnh báo",
    });
  }
};

export const getAlertRuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rule = await alertRuleRepository.findById(id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quy tắc cảnh báo",
      });
    }

    res.json({ success: true, data: rule });
  } catch (error) {
    console.error("Error getting alert rule:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy chi tiết cảnh báo",
    });
  }
};

export const createAlertRule = async (req: Request, res: Response) => {
  try {
    const { name, description, category, threshold, unit, notify_roles } =
      req.body;

    if (!name || !category || threshold === undefined || !unit) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const rule = await alertRuleRepository.create({
      name,
      description,
      category,
      threshold,
      unit,
      notify_roles: notify_roles || [],
    });

    res.status(201).json({ success: true, data: rule });
  } catch (error: any) {
    console.error("Error creating alert rule:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Tên cảnh báo đã tồn tại",
      });
    }
    res.status(500).json({
      success: false,
      message: "Không thể tạo cảnh báo",
    });
  }
};

export const updateAlertRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { threshold, notify_roles, is_enabled, description } = req.body;

    const rule = await alertRuleRepository.update(id, {
      threshold,
      notify_roles,
      is_enabled,
      description,
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quy tắc cảnh báo",
      });
    }

    res.json({ success: true, data: rule });
  } catch (error) {
    console.error("Error updating alert rule:", error);
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật cảnh báo",
    });
  }
};

export const toggleAlertRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rule = await alertRuleRepository.toggleEnabled(id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quy tắc cảnh báo",
      });
    }

    res.json({
      success: true,
      data: rule,
      message: rule.is_enabled ? "Đã bật cảnh báo" : "Đã tắt cảnh báo",
    });
  } catch (error) {
    console.error("Error toggling alert rule:", error);
    res.status(500).json({
      success: false,
      message: "Không thể thay đổi trạng thái cảnh báo",
    });
  }
};

export const deleteAlertRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await alertRuleRepository.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy quy tắc cảnh báo",
      });
    }

    res.json({ success: true, message: "Đã xóa cảnh báo" });
  } catch (error) {
    console.error("Error deleting alert rule:", error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa cảnh báo",
    });
  }
};

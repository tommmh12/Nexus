import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Users,
  Settings,
  RefreshCw,
  Search,
  MoreVertical,
  Eye,
  Power,
  PowerOff,
  Upload,
  X,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../../components/system/ui/Button";
import { Input } from "../../../components/system/ui/Input";
import { floorService, roomService } from "../../../services/bookingService";
import type { FloorPlan, MeetingRoom, CreateFloorRequest, CreateRoomRequest, RoomType } from "../../../types/booking.types";
import { ROOM_TYPE_OPTIONS, EQUIPMENT_OPTIONS } from "../../../types/booking.types";

export const FloorManagement: React.FC = () => {
  // State
  const [floors, setFloors] = useState<FloorPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showRoomListModal, setShowRoomListModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<FloorPlan | null>(null);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);
  const [selectedFloorForRooms, setSelectedFloorForRooms] = useState<FloorPlan | null>(null);
  const [floorRooms, setFloorRooms] = useState<MeetingRoom[]>([]);

  // Form states
  const [floorForm, setFloorForm] = useState<CreateFloorRequest>({
    floorNumber: 1,
    name: "",
    isActive: true,
  });
  const [roomForm, setRoomForm] = useState<CreateRoomRequest>({
    floorId: "",
    name: "",
    capacity: 10,
    roomType: "standard",
    equipment: [],
    requiresApproval: false,
    positionX: 0,
    positionY: 0,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    loadFloors();
  }, []);

  const loadFloors = async () => {
    setLoading(true);
    try {
      const data = await floorService.getFloors(true);
      setFloors(data);
    } catch (error) {
      console.error("Error loading floors:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFloorRooms = async (floor: FloorPlan) => {
    try {
      const rooms = await floorService.getRoomsByFloor(floor.id);
      setFloorRooms(rooms);
      setSelectedFloorForRooms(floor);
      setShowRoomListModal(true);
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  // Floor CRUD
  const openAddFloor = () => {
    setFloorForm({
      floorNumber: floors.length > 0 ? Math.max(...floors.map(f => f.floor_number)) + 1 : 1,
      name: "",
      isActive: true,
    });
    setEditingFloor(null);
    setError(null);
    setShowFloorModal(true);
  };

  const openEditFloor = (floor: FloorPlan) => {
    setFloorForm({
      floorNumber: floor.floor_number,
      name: floor.name,
      layoutImage: floor.layout_image,
      isActive: floor.is_active,
    });
    setEditingFloor(floor);
    setError(null);
    setShowFloorModal(true);
  };

  const handleSaveFloor = async () => {
    setActionLoading(true);
    try {
      if (editingFloor) {
        await floorService.updateFloor(editingFloor.id, floorForm);
      } else {
        await floorService.createFloor(floorForm);
      }
      setShowFloorModal(false);
      loadFloors();
    } catch (error: any) {
      console.error("Error saving floor:", error);
      setError(error.response?.data?.message || "Lỗi khi lưu tầng");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFloor = async (floorId: string) => {
    setActionLoading(true);
    try {
      await floorService.deleteFloor(floorId);
      setDeleteConfirm(null);
      loadFloors();
    } catch (error) {
      console.error("Error deleting floor:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFloorStatus = async (floor: FloorPlan) => {
    try {
      await floorService.updateFloor(floor.id, { isActive: !floor.is_active });
      loadFloors();
    } catch (error) {
      console.error("Error toggling floor status:", error);
    }
  };

  // Room CRUD
  const openAddRoom = (floor: FloorPlan) => {
    setRoomForm({
      floorId: floor.id,
      name: "",
      capacity: 10,
      roomType: "standard",
      equipment: [],
      requiresApproval: false,
      positionX: 0,
      positionY: 0,
    });
    setEditingRoom(null);
    setSelectedFloorForRooms(floor);
    setShowRoomModal(true);
  };

  const openEditRoom = (room: MeetingRoom) => {
    setRoomForm({
      floorId: room.floor_id,
      name: room.name,
      capacity: room.capacity,
      roomType: room.room_type,
      equipment: room.equipment || [],
      requiresApproval: room.requires_approval,
      positionX: room.position_x,
      positionY: room.position_y,
      description: room.description,
    });
    setEditingRoom(room);
    setShowRoomModal(true);
  };

  const handleSaveRoom = async () => {
    setActionLoading(true);
    try {
      if (editingRoom) {
        await roomService.updateRoom(editingRoom.id, roomForm);
      } else {
        await roomService.createRoom(roomForm);
      }
      setShowRoomModal(false);
      if (selectedFloorForRooms) {
        loadFloorRooms(selectedFloorForRooms);
      }
      loadFloors();
    } catch (error) {
      console.error("Error saving room:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    setActionLoading(true);
    try {
      await roomService.deleteRoom(roomId);
      if (selectedFloorForRooms) {
        loadFloorRooms(selectedFloorForRooms);
      }
      loadFloors();
    } catch (error) {
      console.error("Error deleting room:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter
  const filteredFloors = floors.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.floor_number.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-brand-600" />
            Quản lý Tầng & Phòng họp
          </h2>
          <p className="text-slate-500 mt-1">
            Cấu hình các tầng và phòng họp trong tòa nhà
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadFloors}>
            <RefreshCw size={16} />
            Làm mới
          </Button>
          <Button onClick={openAddFloor}>
            <Plus size={16} />
            Thêm tầng mới
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <Building2 size={20} className="text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{floors.length}</p>
              <p className="text-sm text-slate-500">Tổng số tầng</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Power size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {floors.filter((f) => f.is_active).length}
              </p>
              <p className="text-sm text-slate-500">Tầng hoạt động</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {floors.reduce((sum, f) => sum + (f.totalRooms || 0), 0)}
              </p>
              <p className="text-sm text-slate-500">Tổng số phòng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tầng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none w-64"
            />
          </div>
        </div>

        {/* Floor Table */}
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Tầng</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Tên khu vực</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">Số phòng</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">Mặt bằng</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-slate-600">Trạng thái</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFloors.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  <Building2 size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Chưa có tầng nào được cấu hình</p>
                </td>
              </tr>
            ) : (
              filteredFloors.map((floor) => (
                <tr key={floor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-100 text-brand-700 font-bold">
                      {floor.floor_number}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{floor.name}</p>
                      {floor.managerName && (
                        <p className="text-xs text-slate-500">Quản lý: {floor.managerName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => loadFloorRooms(floor)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-full transition-colors"
                    >
                      <MapPin size={14} />
                      {floor.totalRooms || 0} phòng
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {floor.layout_image ? (
                      <a
                        href={floor.layout_image}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 hover:underline"
                        title={floor.layout_image}
                      >
                        <Eye size={12} />
                        Xem ảnh
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Không có</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleFloorStatus(floor)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${floor.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      {floor.is_active ? (
                        <>
                          <Power size={12} />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <PowerOff size={12} />
                          Tạm ngưng
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openAddRoom(floor)}
                        title="Thêm phòng"
                      >
                        <Plus size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditFloor(floor)}
                        title="Chỉnh sửa tầng"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirm(floor.id)}
                        className="text-red-600 hover:bg-red-50"
                        title="Xóa tầng"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floor Modal */}
      {showFloorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-slideIn">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editingFloor ? "Chỉnh sửa tầng" : "Thêm tầng mới"}
              </h3>
              <button
                onClick={() => setShowFloorModal(false)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Số tầng *"
                  type="number"
                  value={floorForm.floorNumber}
                  onChange={(e) =>
                    setFloorForm({ ...floorForm, floorNumber: parseInt(e.target.value) || 1 })
                  }
                  min={1}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    value={floorForm.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      setFloorForm({ ...floorForm, isActive: e.target.value === "active" })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm ngưng</option>
                  </select>
                </div>
              </div>
              <Input
                label="Tên khu vực *"
                value={floorForm.name}
                onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })}
                placeholder="Ví dụ: Tầng 12 - Khu VIP"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Sơ đồ mặt bằng (URL) <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={floorForm.layoutImage || ""}
                  onChange={(e) => setFloorForm({ ...floorForm, layoutImage: e.target.value })}
                  placeholder="https://example.com/floor-plan.png (Có thể để trống)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowFloorModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveFloor} disabled={actionLoading || !floorForm.name}>
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {editingFloor ? "Cập nhật" : "Tạo tầng"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-slideIn max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-slate-900">
                {editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
              </h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Input
                label="Tên phòng *"
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                placeholder="Ví dụ: P.12-01"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Sức chứa *"
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 1 })
                  }
                  min={1}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Loại phòng
                  </label>
                  <select
                    value={roomForm.roomType}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, roomType: e.target.value as RoomType })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    {ROOM_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Thiết bị có sẵn
                </label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => {
                        const newEquipment = roomForm.equipment?.includes(eq)
                          ? roomForm.equipment.filter((e) => e !== eq)
                          : [...(roomForm.equipment || []), eq];
                        setRoomForm({ ...roomForm, equipment: newEquipment });
                      }}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${roomForm.equipment?.includes(eq)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-300"
                        }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={roomForm.description || ""}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  placeholder="Mô tả phòng..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div>
                  <p className="text-sm font-medium text-slate-700">Yêu cầu Admin duyệt</p>
                  <p className="text-xs text-slate-500">
                    Bật nếu muốn Admin phải phê duyệt khi đặt phòng này
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRoomForm({ ...roomForm, requiresApproval: !roomForm.requiresApproval })
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${roomForm.requiresApproval ? "bg-amber-500" : "bg-slate-300"
                    }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${roomForm.requiresApproval ? "translate-x-6" : "translate-x-0.5"
                      }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Vị trí X (px)"
                  type="number"
                  value={roomForm.positionX}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, positionX: parseInt(e.target.value) || 0 })
                  }
                />
                <Input
                  label="Vị trí Y (px)"
                  type="number"
                  value={roomForm.positionY}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, positionY: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setShowRoomModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveRoom} disabled={actionLoading || !roomForm.name}>
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {editingRoom ? "Cập nhật" : "Tạo phòng"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Room List Modal */}
      {showRoomListModal && selectedFloorForRooms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-slideIn max-h-[80vh] overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">
                  Danh sách phòng - {selectedFloorForRooms.name}
                </h3>
                <p className="text-sm text-slate-500">{floorRooms.length} phòng</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => openAddRoom(selectedFloorForRooms)}>
                  <Plus size={14} />
                  Thêm phòng
                </Button>
                <button
                  onClick={() => setShowRoomListModal(false)}
                  className="p-1 rounded hover:bg-slate-100"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
              {floorRooms.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Chưa có phòng nào trong tầng này</p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => openAddRoom(selectedFloorForRooms)}
                  >
                    <Plus size={14} />
                    Thêm phòng đầu tiên
                  </Button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-slate-600">
                        Tên phòng
                      </th>
                      <th className="text-center px-4 py-2 text-xs font-medium text-slate-600">
                        Loại
                      </th>
                      <th className="text-center px-4 py-2 text-xs font-medium text-slate-600">
                        Sức chứa
                      </th>
                      <th className="text-center px-4 py-2 text-xs font-medium text-slate-600">
                        Thiết bị
                      </th>
                      <th className="text-center px-4 py-2 text-xs font-medium text-slate-600">
                        Duyệt
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-slate-600">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {floorRooms.map((room) => (
                      <tr key={room.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{room.name}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${room.room_type === "vip"
                              ? "bg-amber-100 text-amber-700"
                              : room.room_type === "conference"
                                ? "bg-purple-100 text-purple-700"
                                : room.room_type === "training"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {ROOM_TYPE_OPTIONS.find((o) => o.value === room.room_type)?.label ||
                              room.room_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="flex items-center justify-center gap-1 text-sm text-slate-600">
                            <Users size={14} />
                            {room.capacity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-slate-500">
                            {room.equipment?.length || 0} thiết bị
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {room.requires_approval ? (
                            <span className="text-amber-600">
                              <CheckCircle size={16} />
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditRoom(room)}
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteRoom(room.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-slideIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Xác nhận xóa</h3>
                <p className="text-sm text-slate-500">
                  Tất cả phòng trong tầng này cũng sẽ bị xóa
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Hủy
              </Button>
              <Button
                onClick={() => handleDeleteFloor(deleteConfirm)}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Trash2 size={16} className="mr-2" />
                )}
                Xóa tầng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorManagement;

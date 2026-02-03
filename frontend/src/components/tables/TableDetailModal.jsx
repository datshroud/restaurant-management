import React from 'react';
import Modal from '../shared/Modal';

const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);
  if (['available', 'trống', '1', 'có sẵn', 'empty'].includes(normalized)) return 'Trống';
  if (['reserved', 'booked', 'đã đặt', 'đã đặt trước', '2'].includes(normalized)) return 'Đã đặt trước';
  if (['occupied', 'dine in', 'dinein', 'ăn tại chỗ', 'đang dùng', 'đang phục vụ', 'đang sử dụng', '3', 'in use'].includes(normalized)) {
    return 'Đang dùng';
  }
  return status || 'Không xác định';
};

const getLocationParts = (location) => {
  const raw = String(location ?? '').trim();
  if (!raw) return { section: 'Không xác định', position: 'Không xác định' };
  const parts = raw.split(/[-–—|]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { section: parts[0], position: parts.slice(1).join(' - ') };
  }
  return { section: raw, position: 'Không xác định' };
};

const TableDetailModal = ({
  isOpen,
  onClose,
  onEdit,
  onView,
  onDone,
  table,
  order,
  canEdit = false,
}) => {
  const tableName = table?.Name || table?.name || (table?.TableNo ? `Bàn ${table.TableNo}` : `Bàn ${table?.Id ?? ''}`);
  const seats = Number(table?.Seats ?? table?.seats ?? table?.Capacity ?? table?.capacity ?? 0);
  const statusLabel = getStatusLabel(table?.Status ?? table?.status);
  const { section, position } = getLocationParts(table?.Location ?? table?.location);
  const orderId = order?.Id ?? null;
  const orderItems = Number(order?.ItemCount ?? 0);
  const orderTotal = Number(order?.Total ?? 0);

  return (
    <Modal title={tableName ? `Bàn ${tableName.replace(/^Bàn\s*/i, '')}` : 'Bàn'} isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#22c55e] text-sm font-semibold">{statusLabel}</span>
          </div>
          <span className="text-[#ababab] text-sm">{seats || 0} chỗ</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#ababab]">Khu vực</p>
            <p className="text-[#f5f5f5] font-semibold">{section}</p>
          </div>
          <div>
            <p className="text-[#ababab]">Vị trí</p>
            <p className="text-[#f5f5f5] font-semibold">{position}</p>
          </div>
        </div>

        <div className="rounded-lg border border-[#333] p-4 bg-[#1f1f1f]">
          {orderId ? (
            <>
              <div className="flex items-center justify-between">
                <div className="text-[#f5f5f5] font-semibold">
                  Đơn #{orderId}
                </div>
                <div className="text-[#ababab] text-sm">
                  {orderItems} món · {orderTotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                {canEdit ? (
                  <>
                    <button
                      onClick={onEdit}
                      className="text-[#f5f5f5] px-3 py-2 rounded-md bg-[#2b2a2a] hover:bg-[#3a3a3a]"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={onView}
                      className="text-[#f5f5f5] px-3 py-2 rounded-md bg-[#2b2a2a] hover:bg-[#3a3a3a]"
                    >
                      Xem chi tiết
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onView}
                    className="text-[#f5f5f5] px-3 py-2 rounded-md bg-[#2b2a2a] hover:bg-[#3a3a3a]"
                  >
                    Xem chi tiết
                  </button>
                )}
              </div>
              <p className="text-[#7a7a7a] text-xs mt-2">
                {canEdit ? 'Sửa sẽ mở màn hình gọi món.' : 'Đơn đã thanh toán, chỉ xem.'}
              </p>
            </>
          ) : (
            <p className="text-[#ababab] text-sm">Chưa có đơn đang phục vụ.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2b2a2a] text-[#ababab]"
          >
            Hủy
          </button>
          <button
            onClick={onDone}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#f6b100] text-[#1f1f1f]"
          >
            Xong
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TableDetailModal;

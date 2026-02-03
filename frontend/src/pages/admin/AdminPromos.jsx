import React from 'react';

const AdminPromos = () => {
  return (
    <div className="bg-[#2b2a2a] rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h2 className="text-[#f5f5f5] text-lg font-semibold">Quản lý mã giảm giá</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg opacity-60">
            <span className="text-[#8f8f8f] text-sm">🔍</span>
            <input
              disabled
              placeholder="Tìm mã giảm giá..."
              className="bg-transparent text-sm text-[#f5f5f5] outline-none"
            />
          </div>
          <select
            disabled
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none opacity-60"
          >
            <option>Tất cả trạng thái</option>
          </select>
          <select
            disabled
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none opacity-60"
          >
            <option>Sắp xếp</option>
          </select>
        </div>
      </div>
      <div className="text-[#ababab]">
        Chức năng quản lý mã giảm giá đang được phát triển.
      </div>
    </div>
  );
};

export default AdminPromos;

import React, { useEffect, useMemo, useState } from 'react';
import { MdEdit, MdDeleteOutline } from 'react-icons/md';
import Modal from '../../components/shared/Modal';
import api from '../../https/api';

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [tablePage, setTablePage] = useState(1);
  const [isTableModalOpen, setTableModalOpen] = useState(false);
  const [tableSaving, setTableSaving] = useState(false);
  const [editingTableId, setEditingTableId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortKey, setSortKey] = useState('tableNo');
  const [sortDir, setSortDir] = useState('asc');
  const [tableForm, setTableForm] = useState({
    tableNo: '',
    name: '',
    location: '',
    seats: '',
  });

  const parseTableNoFromName = (value) => {
    if (!value) return '';
    const match = String(value).match(/(\d+)/);
    return match ? match[1] : '';
  };

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/tables');
      setTables(res.data ?? []);
    };

    load();
  }, []);

  const tableRows = useMemo(() => {
    return (tables ?? []).map((table) => ({
      id: table.Id,
      tableNo: table.TableNo ?? null,
      name: table.Name,
      location: table.Location ?? '',
      seats: table.Seats,
      status: table.Status,
    }));
  }, [tables]);

  const locationOptions = useMemo(() => {
    const set = new Set();
    tableRows.forEach((table) => {
      if (table.location) set.add(table.location);
    });
    return Array.from(set);
  }, [tableRows]);

  const filteredTables = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    let list = tableRows;

    if (statusFilter !== 'all') {
      list = list.filter((table) => {
        const normalized = String(table.status || '').toLowerCase();
        if (statusFilter === 'available') {
          return ['available', 'trống', '1'].includes(normalized);
        }
        if (statusFilter === 'booked') {
          return ['booked', 'đã đặt', '2'].includes(normalized);
        }
        if (statusFilter === 'occupied') {
          return ['occupied', 'đang dùng', '3', 'dine in', 'dinein'].includes(normalized);
        }
        return true;
      });
    }
    if (locationFilter !== 'all') {
      list = list.filter((table) => table.location === locationFilter);
    }
    if (keyword) {
      list = list.filter((table) => {
        const name = String(table.name || '').toLowerCase();
        const location = String(table.location || '').toLowerCase();
        const tableNo = String(table.tableNo ?? table.id);
        return name.includes(keyword) || location.includes(keyword) || tableNo.includes(keyword);
      });
    }

    const sorted = [...list].sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') {
        return String(a.name || '').localeCompare(String(b.name || ''), 'vi') * direction;
      }
      if (sortKey === 'seats') {
        return (Number(a.seats ?? 0) - Number(b.seats ?? 0)) * direction;
      }
      if (sortKey === 'location') {
        return String(a.location || '').localeCompare(String(b.location || ''), 'vi') * direction;
      }
      const aNo = a.tableNo ?? a.id;
      const bNo = b.tableNo ?? b.id;
      return (aNo - bNo) * direction;
    });
    return sorted;
  }, [tableRows, searchKeyword, statusFilter, locationFilter, sortKey, sortDir]);

  const tablePagination = useMemo(() => {
    const pageSize = 10;
    const total = filteredTables.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const safePage = Math.min(tablePage, totalPages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return {
      pageSize,
      total,
      totalPages,
      page: safePage,
      items: filteredTables.slice(start, end),
    };
  }, [filteredTables, tablePage]);

  useEffect(() => {
    if (tablePage > tablePagination.totalPages) {
      setTablePage(tablePagination.totalPages);
    }
  }, [tablePage, tablePagination.totalPages]);

  useEffect(() => {
    setTablePage(1);
  }, [searchKeyword, statusFilter, locationFilter, sortKey, sortDir]);

  const tableStatusLabel = (status) => {
    if (!status) return 'N/A';
    const normalized = String(status).toLowerCase();
    if (normalized === 'available' || normalized === 'trống' || normalized === '1') return 'Trống';
    if (normalized === 'booked' || normalized === 'đã đặt' || normalized === '2') return 'Đã đặt';
    return status;
  };

  const tableStatusClass = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'available' || normalized === 'trống' || normalized === '1') {
      return 'bg-[#1f3d2a] text-[#22c55e]';
    }
    if (normalized === 'booked' || normalized === 'đã đặt' || normalized === '2') {
      return 'bg-[#4a3a1a] text-[#f6b100]';
    }
    return 'bg-[#3a3a3a] text-[#f5f5f5]';
  };

  const reloadTables = async () => {
    const res = await api.get('/tables');
    setTables(res.data ?? []);
    setTablePage(1);
  };

  const openAddTable = () => {
    setEditingTableId(null);
    setTableForm({
      tableNo: '',
      name: '',
      location: '',
      seats: '',
    });
    setTableModalOpen(true);
  };

  const openEditTable = (table) => {
    setEditingTableId(table.id);
    setTableForm({
      tableNo: table.tableNo ?? parseTableNoFromName(table.name),
      name: table.name ?? '',
      location: table.location ?? '',
      seats: table.seats ?? '',
    });
    setTableModalOpen(true);
  };

  const closeTableModal = () => {
    if (tableSaving) return;
    setTableModalOpen(false);
  };

  const handleSaveTable = async () => {
    if (!tableForm.tableNo || !tableForm.seats) {
      window.alert('Vui lòng nhập số bàn và sức chứa.');
      return;
    }
    setTableSaving(true);
    try {
      const payload = {
        tableNo: Number(tableForm.tableNo),
        name: tableForm.name?.trim() || null,
        location: tableForm.location?.trim() || null,
        seats: Number(tableForm.seats),
      };
      if (editingTableId) {
        await api.put(`/tables/${editingTableId}`, payload);
      } else {
        await api.post('/tables', payload);
      }
      await reloadTables();
      setTableModalOpen(false);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Không thể lưu bàn.';
      window.alert(msg);
    } finally {
      setTableSaving(false);
    }
  };

  const handleDeleteTable = async (table) => {
    const confirmed = window.confirm(`Xóa bàn #${table.tableNo ?? table.id}?`);
    if (!confirmed) return;
    try {
      await api.delete(`/tables/${table.id}`);
      await reloadTables();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Không thể xóa bàn.';
      window.alert(msg);
    }
  };

  return (
    <>
      <div className="bg-[#2b2a2a] rounded-2xl p-6 flex flex-col min-h-0 overflow-hidden">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#f5f5f5] text-lg font-semibold">Quản lý bàn</h2>
            <button
              onClick={openAddTable}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2563eb] text-white"
            >
              + Thêm bàn
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg">
              <span className="text-[#8f8f8f] text-sm">🔍</span>
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm bàn..."
                className="bg-transparent text-sm text-[#f5f5f5] outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Trống</option>
              <option value="booked">Đã đặt</option>
              <option value="occupied">Đang dùng</option>
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
            >
              <option value="all">Tất cả khu vực</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
            >
              <option value="tableNo">Sắp xếp: Số bàn</option>
              <option value="name">Sắp xếp: Tên</option>
              <option value="seats">Sắp xếp: Sức chứa</option>
              <option value="location">Sắp xếp: Khu vực</option>
            </select>
            <button
              onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-3 py-2 rounded-lg text-sm bg-[#1f1f1f] text-[#f5f5f5]"
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        <div className="scrollbar-hide flex-1 min-h-0 overflow-y-auto overflow-x-auto flex flex-col">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[#ababab]">
              <tr>
                <th className="py-3 px-3">Số bàn</th>
                <th className="py-3 px-3">Tên bàn</th>
                <th className="py-3 px-3">Vị trí</th>
                <th className="py-3 px-3">Sức chứa</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-[#f5f5f5]">
              {tablePagination.items.map((table) => (
                <tr key={table.id} className="border-t border-[#3a3a3a]">
                  <td className="py-3 px-3">{table.tableNo ?? table.id}</td>
                  <td className="py-3 px-3">{table.name || `Bàn ${table.tableNo ?? table.id}`}</td>
                  <td className="py-3 px-3 text-[#ababab]">{table.location || 'N/A'}</td>
                  <td className="py-3 px-3">{table.seats} người</td>
                  <td className="py-3 px-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tableStatusClass(table.status)}`}>
                      {tableStatusLabel(table.status)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditTable(table)}
                        className="h-8 w-8 rounded-lg border border-[#2563eb] text-[#93c5fd] flex items-center justify-center"
                        aria-label="Sửa bàn"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table)}
                        className="h-8 w-8 rounded-lg border border-red-400 text-red-300 flex items-center justify-center"
                        aria-label="Xóa bàn"
                      >
                        <MdDeleteOutline />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tablePagination.total === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#ababab]">
                    Chưa có dữ liệu bàn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {tablePagination.total > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-[#ababab]">
            <span>
              Hiển thị {tablePagination.items.length} / {tablePagination.total} bàn
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTablePage((prev) => Math.max(prev - 1, 1))}
                disabled={tablePagination.page <= 1}
                className="px-3 py-1 rounded-md bg-[#1f1f1f] text-[#f5f5f5] disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-[#f5f5f5]">
                {tablePagination.page} / {tablePagination.totalPages}
              </span>
              <button
                onClick={() => setTablePage((prev) => Math.min(prev + 1, tablePagination.totalPages))}
                disabled={tablePagination.page >= tablePagination.totalPages}
                className="px-3 py-1 rounded-md bg-[#1f1f1f] text-[#f5f5f5] disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        title={editingTableId ? 'Cập nhật bàn' : 'Thêm bàn mới'}
        isOpen={isTableModalOpen}
        onClose={closeTableModal}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#ababab]">Số bàn</label>
            <input
              type="number"
              min="1"
              value={tableForm.tableNo}
              onChange={(e) => setTableForm((prev) => ({ ...prev, tableNo: e.target.value }))}
              placeholder="Nhập số bàn"
              className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[#ababab]">Tên bàn (nếu có)</label>
            <input
              type="text"
              value={tableForm.name}
              onChange={(e) => setTableForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="VD: VIP 1, Bàn góc..."
              className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[#ababab]">Vị trí</label>
            <input
              type="text"
              value={tableForm.location}
              onChange={(e) => setTableForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="VD: Tầng 1, Ngoài trời..."
              className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[#ababab]">Sức chứa</label>
            <input
              type="number"
              min="1"
              value={tableForm.seats}
              onChange={(e) => setTableForm((prev) => ({ ...prev, seats: e.target.value }))}
              placeholder="Nhập số chỗ"
              className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={closeTableModal}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2b2a2a] text-[#ababab]"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveTable}
              disabled={tableSaving || !tableForm.tableNo || !tableForm.seats}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                tableSaving || !tableForm.tableNo || !tableForm.seats
                  ? 'bg-[#444] text-[#ababab]'
                  : 'bg-[#2563eb] text-white'
              }`}
            >
              {tableSaving ? 'Đang lưu...' : editingTableId ? 'Lưu' : 'Thêm'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminTables;

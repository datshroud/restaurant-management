import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/shared/Modal';
import api from '../../https/api';

const userRoleOptions = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'cashier', label: 'Thu ngân' },
  { value: 'waiter', label: 'Phục vụ' },
  { value: 'staff', label: 'Nhân viên' },
];

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [userSaving, setUserSaving] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'staff',
  });

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/users');
      setUsers(res.data ?? []);
    };

    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    let list = users ?? [];
    if (roleFilter !== 'all') {
      list = list.filter((user) => (user.Role || 'staff') === roleFilter);
    }
    if (keyword) {
      list = list.filter((user) => {
        const name = (user.FullName || '').toLowerCase();
        const email = (user.Email || '').toLowerCase();
        const phone = (user.Phone || '').toLowerCase();
        const role = (user.Role || '').toLowerCase();
        return (
          name.includes(keyword) ||
          email.includes(keyword) ||
          phone.includes(keyword) ||
          role.includes(keyword)
        );
      });
    }
    const sorted = [...list].sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'date') {
        const left = new Date(a.CreatedAt || 0).getTime();
        const right = new Date(b.CreatedAt || 0).getTime();
        return (left - right) * direction;
      }
      if (sortKey === 'role') {
        return String(a.Role || '').localeCompare(String(b.Role || ''), 'vi') * direction;
      }
      return String(a.FullName || '').localeCompare(String(b.FullName || ''), 'vi') * direction;
    });
    return sorted;
  }, [users, userSearch, roleFilter, sortKey, sortDir]);

  const userPagination = useMemo(() => {
    const pageSize = 10;
    const total = filteredUsers.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const safePage = Math.min(userPage, totalPages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return {
      pageSize,
      total,
      totalPages,
      page: safePage,
      items: filteredUsers.slice(start, end),
    };
  }, [filteredUsers, userPage]);

  useEffect(() => {
    if (userPage > userPagination.totalPages) {
      setUserPage(userPagination.totalPages);
    }
  }, [userPage, userPagination.totalPages]);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch, roleFilter, sortKey, sortDir]);

  const isEditingAdmin = Boolean(editingUserId && userForm.role === 'admin');
  const isEditing = Boolean(editingUserId);

  const roleOptionsForForm = useMemo(() => {
    if (isEditingAdmin) {
      return userRoleOptions.filter((role) => role.value === 'admin');
    }
    return userRoleOptions.filter((role) => role.value !== 'admin');
  }, [isEditingAdmin]);

  const reloadUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data ?? []);
    setUserPage(1);
  };

  const openCreateUser = () => {
    setEditingUserId(null);
    setUserForm({
      fullName: '',
      email: '',
      phone: '',
      role: 'staff',
    });
    setUserModalOpen(true);
  };

  const openEditUser = (user) => {
    setEditingUserId(user.Id);
    setUserForm({
      fullName: user.FullName || '',
      email: user.Email || '',
      phone: user.Phone || '',
      role: user.Role || 'staff',
    });
    setUserModalOpen(true);
  };

  const closeUserModal = () => {
    if (userSaving) return;
    setUserModalOpen(false);
  };

  const handleSaveUser = async () => {
    if (isEditingAdmin) {
      window.alert('Tài khoản admin không thể chỉnh sửa.');
      return;
    }
    if (!isEditing && (!userForm.email.trim() || !userForm.fullName.trim())) {
      window.alert('Vui lòng nhập họ tên và email.');
      return;
    }

    setUserSaving(true);
    try {
      const payload = isEditing
        ? { role: userForm.role || 'staff' }
        : {
            email: userForm.email.trim(),
            fullName: userForm.fullName.trim(),
            phone: userForm.phone.trim() || null,
            role: userForm.role || 'staff',
          };

      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, payload);
      } else {
        await api.post('/users', payload);
      }

      await reloadUsers();
      setUserModalOpen(false);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu người dùng.';
      window.alert(message);
    } finally {
      setUserSaving(false);
    }
  };


  return (
    <div className="bg-[#2b2a2a] rounded-2xl p-6 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[#f5f5f5] text-lg font-semibold">Quản lý người dùng</h2>
          <p className="text-[#8f8f8f] text-sm">Quản lý tài khoản theo dữ liệu người dùng.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg">
            <span className="text-[#8f8f8f] text-sm">🔍</span>
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Tìm kiếm người dùng..."
              className="bg-transparent text-sm text-[#f5f5f5] outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="all">Tất cả vai trò</option>
            {userRoleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="name">Sắp xếp: Tên</option>
            <option value="date">Sắp xếp: Ngày đăng ký</option>
            <option value="role">Sắp xếp: Vai trò</option>
          </select>
          <button
            onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-2 rounded-lg text-sm bg-[#1f1f1f] text-[#f5f5f5]"
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
          <button
            onClick={openCreateUser}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2563eb] text-white"
          >
            Thêm người dùng
          </button>
        </div>
      </div>

      <div className="scrollbar-hide flex-1 min-h-0 overflow-y-auto overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[#ababab]">
            <tr>
              <th className="py-3 px-3">Người dùng</th>
              <th className="py-3 px-3">Liên hệ</th>
              <th className="py-3 px-3">Vai trò</th>
              <th className="py-3 px-3">Ngày đăng ký</th>
              <th className="py-3 px-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-[#f5f5f5]">
            {userPagination.items.map((user) => (
              <tr key={user.Id} className="border-t border-[#3a3a3a]">
                <td className="py-3 px-3">
                  <div className="flex flex-col">
                    <span className="font-semibold">{user.FullName || 'Chưa cập nhật'}</span>
                    <span className="text-xs text-[#8f8f8f]">{user.Email}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-[#ababab]">
                  {user.Phone || 'Chưa cập nhật'}
                </td>
                <td className="py-3 px-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1f1f1f] text-[#93c5fd]">
                    {userRoleOptions.find((opt) => opt.value === user.Role)?.label || user.Role || 'staff'}
                  </span>
                </td>
                <td className="py-3 px-3 text-[#ababab]">
                  {formatDateTime(user.CreatedAt)}
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => openEditUser(user)}
                    className="px-3 py-1 rounded-md bg-[#2563eb] text-white text-xs"
                  >
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
            {userPagination.total === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[#ababab]">
                  Chưa có người dùng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-[#ababab]">
        <span>
          Hiển thị {userPagination.items.length} / {userPagination.total} người dùng
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
            disabled={userPagination.page <= 1}
            className="px-3 py-1 rounded-md bg-[#1f1f1f] text-[#f5f5f5] disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-[#f5f5f5]">
            {userPagination.page} / {userPagination.totalPages}
          </span>
          <button
            onClick={() => setUserPage((prev) => Math.min(prev + 1, userPagination.totalPages))}
            disabled={userPagination.page >= userPagination.totalPages}
            className="px-3 py-1 rounded-md bg-[#1f1f1f] text-[#f5f5f5] disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

      <Modal
        title={editingUserId ? 'Cập nhật người dùng' : 'Thêm người dùng'}
        isOpen={isUserModalOpen}
        onClose={closeUserModal}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[#ababab]">Họ và tên</label>
              <input
                type="text"
                value={userForm.fullName}
                onChange={(e) => setUserForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nhập họ và tên"
                disabled={isEditingAdmin || isEditing}
                className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#ababab]">Email</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Nhập email"
                disabled={isEditingAdmin || isEditing}
                className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#ababab]">Số điện thoại</label>
              <input
                type="text"
                value={userForm.phone}
                onChange={(e) => setUserForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Nhập số điện thoại"
                disabled={isEditingAdmin || isEditing}
                className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#ababab]">Vai trò</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
                disabled={isEditingAdmin}
                className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
              >
                {roleOptionsForForm.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!editingUserId && !isEditingAdmin && (
            <p className="text-xs text-[#8f8f8f]">Mật khẩu mặc định: 123456.</p>
          )}

          {isEditing && !isEditingAdmin && (
            <p className="text-xs text-[#8f8f8f]">Chỉ được chỉnh sửa vai trò.</p>
          )}

          {isEditingAdmin && (
            <p className="text-xs text-[#fca5a5]">
              Tài khoản admin không thể chỉnh sửa.
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={closeUserModal}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2b2a2a] text-[#ababab]"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveUser}
              disabled={userSaving || isEditingAdmin}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2563eb] text-white disabled:opacity-60"
            >
              {userSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;

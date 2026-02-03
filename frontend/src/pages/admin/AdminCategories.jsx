import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/shared/Modal';
import api from '../../https/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '' });
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [countFilter, setCountFilter] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    const load = async () => {
      const [catRes, itemRes] = await Promise.all([
        api.get('/menu/categories'),
        api.get('/menu/items/all'),
      ]);
      setCategories(catRes.data ?? []);
      setMenuItems(itemRes.data ?? []);
    };

    load();
  }, []);

  useEffect(() => {
    setCategoryPage(1);
  }, [searchKeyword, countFilter, sortKey, sortDir]);

  const categoryRows = useMemo(() => {
    return (categories ?? []).map((cat) => {
      const count = (menuItems ?? []).filter((item) => item.CategoryId === cat.Id)
        .length;
      return {
        id: cat.Id,
        name: cat.Name,
        itemCount: count,
      };
    });
  }, [categories, menuItems]);

  const filteredCategories = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    let list = categoryRows;
    if (countFilter === 'has') {
      list = list.filter((item) => item.itemCount > 0);
    }
    if (countFilter === 'empty') {
      list = list.filter((item) => item.itemCount === 0);
    }
    if (keyword) {
      list = list.filter((item) => {
        const name = String(item.name || '').toLowerCase();
        return name.includes(keyword) || String(item.id).includes(keyword);
      });
    }
    const sorted = [...list].sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'id') return (a.id - b.id) * direction;
      if (sortKey === 'count') return (a.itemCount - b.itemCount) * direction;
      return String(a.name || '').localeCompare(String(b.name || ''), 'vi') * direction;
    });
    return sorted;
  }, [categoryRows, searchKeyword, countFilter, sortKey, sortDir]);

  const categoryTotalPages = Math.max(1, Math.ceil(filteredCategories.length / 10));
  const categoryPageItems = useMemo(() => {
    const start = (categoryPage - 1) * 10;
    return filteredCategories.slice(start, start + 10);
  }, [filteredCategories, categoryPage]);

  const reloadCategories = async () => {
    const [catRes, itemRes] = await Promise.all([
      api.get('/menu/categories'),
      api.get('/menu/items/all'),
    ]);
    setCategories(catRes.data ?? []);
    setMenuItems(itemRes.data ?? []);
    setCategoryPage(1);
  };

  const openCreateCategory = () => {
    setCategoryForm({ id: null, name: '' });
    setCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setCategoryForm({ id: cat.id, name: cat.name });
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    if (categorySaving) return;
    setCategoryModalOpen(false);
  };

  const handleSaveCategory = async () => {
    const name = categoryForm.name.trim();
    if (!name) return;
    setCategorySaving(true);
    try {
      if (categoryForm.id) {
        await api.put(`/menu/categories/${categoryForm.id}`, { name });
      } else {
        await api.post('/menu/categories', { name });
      }
      await reloadCategories();
      setCategoryModalOpen(false);
    } catch (err) {
      const message = err?.response?.data?.message || 'Không thể lưu danh mục.';
      window.alert(message);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const ok = window.confirm(`Xóa danh mục "${cat.name}"?`);
    if (!ok) return;
    await api.delete(`/menu/categories/${cat.id}`);
    await reloadCategories();
  };

  return (
    <div className="bg-[#2b2a2a] rounded-2xl p-6 flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[#f5f5f5] text-lg font-semibold">Quản lý danh mục</h2>
          <button
            onClick={openCreateCategory}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#f6b100] text-[#1a1a1a] hover:bg-[#d69a03]"
          >
            Thêm danh mục
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg">
            <span className="text-[#8f8f8f] text-sm">🔍</span>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm danh mục..."
              className="bg-transparent text-sm text-[#f5f5f5] outline-none"
            />
          </div>
          <select
            value={countFilter}
            onChange={(e) => setCountFilter(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="all">Tất cả</option>
            <option value="has">Có món</option>
            <option value="empty">Trống</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="name">Sắp xếp: Tên</option>
            <option value="id">Sắp xếp: Mã</option>
            <option value="count">Sắp xếp: Số món</option>
          </select>
          <button
            onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-2 rounded-lg text-sm bg-[#1f1f1f] text-[#f5f5f5]"
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      <div className="scrollbar-hide flex-1 min-h-0 overflow-y-auto flex flex-col">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[#ababab]">
            <tr>
              <th className="py-3 px-3">Mã</th>
              <th className="py-3 px-3">Tên danh mục</th>
              <th className="py-3 px-3">Số món</th>
              <th className="py-3 px-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-[#f5f5f5]">
            {categoryPageItems.map((cat) => (
              <tr key={cat.id} className="border-t border-[#3a3a3a]">
                <td className="py-3 px-3">#{cat.id}</td>
                <td className="py-3 px-3">{cat.name}</td>
                <td className="py-3 px-3">{cat.itemCount}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditCategory(cat)}
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-[#f6b100] text-[#f6b100]"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="px-3 py-1 rounded-md text-xs font-semibold border border-red-400 text-red-300"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCategories.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-[#ababab]">
                  Không có danh mục phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredCategories.length > 0 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={() => setCategoryPage((prev) => Math.max(1, prev - 1))}
            disabled={categoryPage === 1}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#1f1f1f] text-[#ababab] disabled:opacity-50"
          >
            Trước
          </button>
          {Array.from({ length: categoryTotalPages }, (_, idx) => idx + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCategoryPage(page)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                page === categoryPage
                  ? 'bg-[#f6b100] text-[#1a1a1a]'
                  : 'bg-[#1f1f1f] text-[#ababab]'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCategoryPage((prev) => Math.min(categoryTotalPages, prev + 1))}
            disabled={categoryPage === categoryTotalPages}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#1f1f1f] text-[#ababab] disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      <Modal
        title={categoryForm.id ? 'Cập nhật danh mục' : 'Thêm danh mục'}
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#ababab]">Tên danh mục</label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên danh mục"
              className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={closeCategoryModal}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2b2a2a] text-[#ababab]"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveCategory}
              disabled={categorySaving || !categoryForm.name.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                categorySaving || !categoryForm.name.trim()
                  ? 'bg-[#444] text-[#ababab]'
                  : 'bg-[#f6b100] text-[#1a1a1a] hover:bg-[#d69a03]'
              }`}
            >
              {categorySaving ? 'Đang lưu...' : categoryForm.id ? 'Lưu' : 'Thêm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCategories;

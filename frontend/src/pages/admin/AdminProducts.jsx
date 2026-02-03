import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/shared/Modal';
import api from '../../https/api';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    Number(value || 0),
  );

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const rawBase = import.meta.env.VITE_API_URL || '';
  const base = rawBase.replace(/\/api\/?$/, '').replace(/\/$/, '');
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${base}${normalized}`;
};

const resolveFrontendImageUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${window.location.origin}${normalized}`;
};

const AdminProducts = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    categoryId: '',
    isActive: true,
    stockQty: '',
    stockUnit: '',
    imageUrl: '',
    imageFile: null,
    description: '',
  });

  const productImagePreview = useMemo(() => {
    if (productForm.imageFile) {
      return URL.createObjectURL(productForm.imageFile);
    }
    return resolveImageUrl(productForm.imageUrl);
  }, [productForm.imageFile, productForm.imageUrl]);

  useEffect(() => {
    return () => {
      if (productForm.imageFile && productImagePreview) {
        URL.revokeObjectURL(productImagePreview);
      }
    };
  }, [productForm.imageFile, productImagePreview]);

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

  const categoryMap = useMemo(() => {
    const map = new Map();
    (categories ?? []).forEach((cat) => map.set(cat.Id, cat.Name));
    return map;
  }, [categories]);

  const filteredMenuItems = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    let list = menuItems ?? [];

    if (categoryFilter !== 'all') {
      list = list.filter((item) => String(item.CategoryId) === categoryFilter);
    }
    if (statusFilter !== 'all') {
      const expected = statusFilter === 'active';
      list = list.filter((item) => Boolean(item.IsActive) === expected);
    }
    if (stockFilter !== 'all') {
      list = list.filter((item) => {
        const hasStockQty = item.StockQty !== null && item.StockQty !== undefined && item.StockQty !== '';
        if (!hasStockQty) return stockFilter === 'in';
        const qty = Number(item.StockQty ?? 0);
        if (stockFilter === 'in') return qty > 0;
        if (stockFilter === 'out') return qty <= 0;
        return true;
      });
    }
    if (keyword) {
      list = list.filter((item) => {
        const name = String(item.Name || '').toLowerCase();
        const desc = String(item.Description || '').toLowerCase();
        const categoryName = String(categoryMap.get(item.CategoryId) || '').toLowerCase();
        return (
          name.includes(keyword) ||
          desc.includes(keyword) ||
          categoryName.includes(keyword) ||
          String(item.Id).includes(keyword)
        );
      });
    }

    const sorted = [...list].sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'price') return (Number(a.Price ?? 0) - Number(b.Price ?? 0)) * direction;
      if (sortKey === 'stock') return (Number(a.StockQty ?? 0) - Number(b.StockQty ?? 0)) * direction;
      if (sortKey === 'category') {
        const left = String(categoryMap.get(a.CategoryId) || '');
        const right = String(categoryMap.get(b.CategoryId) || '');
        return left.localeCompare(right, 'vi') * direction;
      }
      return String(a.Name || '').localeCompare(String(b.Name || ''), 'vi') * direction;
    });
    return sorted;
  }, [menuItems, searchKeyword, categoryFilter, statusFilter, stockFilter, sortKey, sortDir, categoryMap]);

  const reloadMenuItems = async () => {
    const res = await api.get('/menu/items/all');
    setMenuItems(res.data ?? []);
  };

  const openAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      price: '',
      categoryId: categories[0]?.Id ?? '',
      isActive: true,
      stockQty: '',
      stockUnit: '',
      imageUrl: '',
      imageFile: null,
      description: '',
    });
    setProductModalOpen(true);
  };

  const openEditProduct = (item) => {
    setEditingProductId(item.Id);
    setProductForm({
      name: item.Name ?? '',
      price: item.Price ?? '',
      categoryId: item.CategoryId ?? '',
      isActive: Boolean(item.IsActive),
      stockQty: item.StockQty ?? '',
      stockUnit: item.StockUnit ?? '',
      imageUrl: item.ImageUrl ?? '',
      imageFile: null,
      description: item.Description ?? '',
    });
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    if (productSaving) return;
    setProductModalOpen(false);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      window.alert('Vui lòng nhập tên món, giá và danh mục.');
      return;
    }
    setProductSaving(true);
    try {
      let imageUrl = productForm.imageUrl || null;
      if (productForm.imageFile) {
        const formData = new FormData();
        formData.append('file', productForm.imageFile);
        const uploadRes = await api.post('/menu/items/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = uploadRes.data?.url || null;
      }
      const payload = {
        name: productForm.name,
        price: Number(productForm.price),
        categoryId: Number(productForm.categoryId),
        isActive: Boolean(productForm.isActive),
        stockQty: productForm.stockQty === '' ? null : Number(productForm.stockQty),
        stockUnit: productForm.stockUnit || null,
        imageUrl,
        description: productForm.description || null,
      };

      if (editingProductId) {
        await api.put(`/menu/items/${editingProductId}`, payload);
      } else {
        await api.post('/menu/items', payload);
      }
      await reloadMenuItems();
      setProductModalOpen(false);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Không thể lưu món ăn.';
      window.alert(msg);
    } finally {
      setProductSaving(false);
    }
  };

  const handleDeleteProduct = async (item) => {
    const confirmed = window.confirm(`Xóa món "${item.Name}"?`);
    if (!confirmed) return;
    try {
      await api.delete(`/menu/items/${item.Id}`);
      await reloadMenuItems();
    } catch {
      window.alert('Không thể xóa món ăn.');
    }
  };

  return (
    <div className="bg-[#2b2a2a] rounded-2xl p-6 flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[#f5f5f5] text-lg font-semibold">Quản lý món ăn</h2>
          <button
            onClick={openAddProduct}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#f6b100] text-[#1a1a1a] hover:bg-[#d69a03]"
          >
            Thêm món ăn
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg">
            <span className="text-[#8f8f8f] text-sm">🔍</span>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm món ăn..."
              className="bg-transparent text-sm text-[#f5f5f5] outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.Id} value={String(cat.Id)}>
                {cat.Name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Có sẵn</option>
            <option value="inactive">Ngưng bán</option>
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="all">Tất cả kho</option>
            <option value="in">Còn hàng</option>
            <option value="out">Hết hàng</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="name">Sắp xếp: Tên</option>
            <option value="price">Sắp xếp: Giá</option>
            <option value="stock">Sắp xếp: Kho</option>
            <option value="category">Sắp xếp: Danh mục</option>
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
              <th className="py-3 px-3">Hình ảnh</th>
              <th className="py-3 px-3">Tên món</th>
              <th className="py-3 px-3">Giá</th>
              <th className="py-3 px-3">Danh mục</th>
              <th className="py-3 px-3">Trạng thái</th>
              <th className="py-3 px-3">Kho</th>
              <th className="py-3 px-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-[#f5f5f5]">
            {filteredMenuItems.map((item) => (
              <tr key={item.Id} className="border-t border-[#3a3a3a]">
                <td className="py-3 px-3">
                  <div className="h-16 w-16 rounded-lg bg-[#1f1f1f] overflow-hidden">
                    {item.ImageUrl ? (
                      <img
                        src={resolveImageUrl(item.ImageUrl)}
                        alt={item.Name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = resolveFrontendImageUrl(item.ImageUrl);
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#ababab] text-xs">
                        N/A
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <p className="font-semibold">{item.Name}</p>
                  {item.Description && (
                    <p className="text-[#ababab] text-xs mt-1 max-w-md">
                      {item.Description}
                    </p>
                  )}
                </td>
                <td className="py-3 px-3 text-[#86efac] font-semibold">
                  {formatCurrency(item.Price)}
                </td>
                <td className="py-3 px-3">
                  <span className="px-3 py-1 rounded-full bg-[#1f1f1f] text-[#93c5fd]">
                    {categoryMap.get(item.CategoryId) || 'N/A'}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.IsActive
                        ? 'bg-[#1f3d2a] text-[#22c55e]'
                        : 'bg-[#3a3a3a] text-[#fca5a5]'
                    }`}
                  >
                    {item.IsActive ? 'Có sẵn' : 'Ngưng bán'}
                  </span>
                </td>
                <td className="py-3 px-3 text-[#ababab]">
                  {item.StockQty === null || item.StockQty === undefined || item.StockQty === ''
                    ? 'N/A'
                    : `${item.StockQty} ${item.StockUnit || ''}`.trim()}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditProduct(item)}
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-[#f6b100] text-[#f6b100]"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(item)}
                      className="px-3 py-1 rounded-md text-xs font-semibold border border-red-400 text-red-300"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredMenuItems.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-[#ababab]">
                  Không có món ăn phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editingProductId ? 'Cập nhật món ăn' : 'Thêm món ăn'}
        isOpen={isProductModalOpen}
        onClose={closeProductModal}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[#ababab]">Tên món</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên món"
                className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#ababab]">Giá (đ)</label>
              <input
                type="number"
                min="0"
                value={productForm.price}
                onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="Nhập giá"
                className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#ababab]">Danh mục</label>
              <select
                value={productForm.categoryId}
                onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.Id} value={cat.Id}>
                    {cat.Name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#ababab]">Trạng thái</label>
              <select
                value={productForm.isActive ? '1' : '0'}
                onChange={(e) => setProductForm((prev) => ({ ...prev, isActive: e.target.value === '1' }))}
                className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
              >
                <option value="1">Có sẵn</option>
                <option value="0">Ngưng bán</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#ababab]">Số lượng kho</label>
              <input
                type="number"
                min="0"
                value={productForm.stockQty}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stockQty: e.target.value }))}
                placeholder="Nhập số lượng"
                className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#ababab]">Đơn vị</label>
              <input
                type="text"
                value={productForm.stockUnit}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stockUnit: e.target.value }))}
                placeholder="Ví dụ: phần, đĩa"
                className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#ababab]">Hình ảnh</label>
            <div className="flex items-center gap-4">
              <label className="h-24 w-24 rounded-xl border border-dashed border-[#3a3a3a] bg-[#1f1f1f] flex flex-col items-center justify-center gap-2 text-[#ababab] cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProductForm((prev) => ({ ...prev, imageFile: file }));
                  }}
                />
                <span className="text-lg">⤓</span>
                <span className="text-xs">Tải lên</span>
              </label>
              {productImagePreview ? (
                <img
                  src={productImagePreview}
                  alt="Preview"
                  className="h-24 w-24 rounded-xl object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-xl bg-[#1f1f1f] flex items-center justify-center text-[#555] text-xs">
                  N/A
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#ababab]">Mô tả</label>
            <textarea
              rows={4}
              value={productForm.description}
              onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Nhập mô tả món ăn"
              className="bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={closeProductModal}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2b2a2a] text-[#ababab]"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={productSaving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#f6b100] text-[#1a1a1a] hover:bg-[#d69a03] disabled:opacity-60"
            >
              {productSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProducts;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdTableBar, MdOutlineAnalytics, MdOutlineReorder, MdPeople, MdLocalOffer, MdEdit, MdDeleteOutline } from 'react-icons/md';
import { BiSolidDish, BiCategoryAlt } from 'react-icons/bi';
import { BsCashCoin } from 'react-icons/bs';
import { GrInProgress } from 'react-icons/gr';
import { CiViewList } from 'react-icons/ci';
import Greetings from '../components/home/Greetings';
import MiniCard from '../components/home/MiniCard';
import PopularDishes from '../components/home/PopularDishes';
import OutOfStock from '../components/home/OutOfStock';
import ProgressAndPayment from '../components/home/ProgressAndPayment';
import Modal from '../components/shared/Modal';
import api from '../https/api';

const statusOptions = [
  { value: 'pending', label: 'Chờ xử lý', color: 'text-[#d1d1d1]', bg: 'bg-[#2c2c2c]' },
  { value: 'progress', label: 'Đang xử lý', color: 'text-[#f6b100]', bg: 'bg-[#51432a]' },
  { value: 'ready', label: 'Sẵn sàng', color: 'text-[#02ca3a]', bg: 'bg-[#1f3d2a]' },
  { value: 'completed', label: 'Hoàn thành', color: 'text-[#61dafb]', bg: 'bg-[#1c2a33]' },
];

const userRoleOptions = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'cashier', label: 'Thu ngân' },
  { value: 'waiter', label: 'Phục vụ' },
  { value: 'staff', label: 'Nhân viên' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    Number(value || 0),
  );

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
};

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

const getRangeBounds = (rangeKey) => {
  const now = new Date();
  if (Number.isNaN(now.getTime())) return { start: null, end: null };
  let start = null;
  switch (rangeKey) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), quarterStartMonth, 1);
      break;
    }
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
    default:
      start = null;
      break;
  }
  return { start, end: now };
};

const AdminMore = () => {
  const [tab, setTab] = useState('metrics');
  const [rangeKey, setRangeKey] = useState('today');
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [popular, setPopular] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [productPage, setProductPage] = useState(1);
  const [tables, setTables] = useState([]);
  const [tablePage, setTablePage] = useState(1);
  const [isTableModalOpen, setTableModalOpen] = useState(false);
  const [tableSaving, setTableSaving] = useState(false);
  const [editingTableId, setEditingTableId] = useState(null);
  const [tableForm, setTableForm] = useState({
    tableNo: '',
    name: '',
    location: '',
    seats: '',
  });
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '' });
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
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
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [userSaving, setUserSaving] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'staff',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role') || 'staff';
    if (role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, paymentsRes, popularRes, outRes, catRes, itemRes, tableRes, usersRes] = await Promise.all([
        api.get('/orders'),
        api.get('/payments'),
        api.get('/menu/popular?limit=5'),
        api.get('/menu/out-of-stock?limit=5'),
        api.get('/menu/categories'),
        api.get('/menu/items/all'),
        api.get('/tables'),
        api.get('/users'),
      ]);
      setOrders(ordersRes.data ?? []);
      setPayments(paymentsRes.data ?? []);
      setPopular((popularRes.data ?? []).map((item) => ({
        id: item.Id,
        name: item.Name,
        image: item.ImageUrl,
        numberOfOrders: item.OrdersCount ?? 0,
      })));
      setOutOfStock((outRes.data ?? []).map((item) => ({
        id: item.Id,
        name: item.Name,
        image: item.ImageUrl,
      })));
      setCategories(catRes.data ?? []);
      setMenuItems(itemRes.data ?? []);
      setTables(tableRes.data ?? []);
      setUsers(usersRes.data ?? []);
    };

    load();
  }, [rangeKey]);

  const paymentByOrder = useMemo(() => {
    const map = new Map();
    payments.forEach((payment) => {
      if (!payment?.OrderId) return;
      map.set(payment.OrderId, payment);
    });
    return map;
  }, [payments]);

  const rangeBounds = useMemo(() => getRangeBounds(rangeKey), [rangeKey]);

  const filteredPayments = useMemo(() => {
    if (!rangeBounds.start) return payments;
    return payments.filter((payment) => {
      const date = new Date(payment.PaidAt);
      if (Number.isNaN(date.getTime())) return false;
      return date >= rangeBounds.start && date <= rangeBounds.end;
    });
  }, [payments, rangeBounds]);

  const filteredOrders = useMemo(() => {
    if (!rangeBounds.start) return orders;
    return orders.filter((order) => {
      const date = new Date(order.CreatedAt);
      if (Number.isNaN(date.getTime())) return false;
      return date >= rangeBounds.start && date <= rangeBounds.end;
    });
  }, [orders, rangeBounds]);

  const totalEarning = useMemo(() =>
    (filteredPayments ?? []).reduce((sum, p) => sum + Number(p.Amount ?? 0), 0),
    [filteredPayments],
  );
  const inProgressCount = useMemo(() =>
    (filteredOrders ?? []).filter((o) => o.Status === 'progress').length,
    [filteredOrders],
  );
  const waitingCount = useMemo(() =>
    (filteredOrders ?? []).filter((o) => o.Status === 'pending').length,
    [filteredOrders],
  );

  const getStatusMeta = (status) =>
    statusOptions.find((opt) => opt.value === status) || statusOptions[0];

  const handleStatusChange = (orderId, nextStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [orderId]: nextStatus }));
  };

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

  const categoryTotalPages = Math.max(1, Math.ceil(categoryRows.length / 10));
  const categoryPageItems = useMemo(() => {
    const start = (categoryPage - 1) * 10;
    return categoryRows.slice(start, start + 10);
  }, [categoryRows, categoryPage]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    (categories ?? []).forEach((cat) => map.set(cat.Id, cat.Name));
    return map;
  }, [categories]);

  const productPagination = useMemo(() => {
    const pageSize = 10;
    const total = menuItems.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const safePage = Math.min(productPage, totalPages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return {
      pageSize,
      total,
      totalPages,
      page: safePage,
      items: menuItems.slice(start, end),
    };
  }, [menuItems, productPage]);

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    if (!keyword) return users;
    return (users ?? []).filter((user) => {
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
  }, [users, userSearch]);

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

  const isEditingAdmin = Boolean(editingUserId && userForm.role === 'admin');
  const isEditing = Boolean(editingUserId);

  const roleOptionsForForm = useMemo(() => {
    if (isEditingAdmin) {
      return userRoleOptions.filter((role) => role.value === 'admin');
    }
    return userRoleOptions.filter((role) => role.value !== 'admin');
  }, [isEditingAdmin]);

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
    if (productPage > productPagination.totalPages) {
      setProductPage(productPagination.totalPages);
    }
  }, [productPage, productPagination.totalPages]);

  useEffect(() => {
    if (userPage > userPagination.totalPages) {
      setUserPage(userPagination.totalPages);
    }
  }, [userPage, userPagination.totalPages]);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch]);

  useEffect(() => {
    if (tablePage > tablePagination.totalPages) {
      setTablePage(tablePagination.totalPages);
    }
  }, [tablePage, tablePagination.totalPages]);

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

  const reloadMenuItems = async () => {
    const res = await api.get('/menu/items/all');
    setMenuItems(res.data ?? []);
    setProductPage(1);
  };

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

  const tableRows = useMemo(() => {
    return (tables ?? [])
      .map((table) => ({
        id: table.Id,
        tableNo: table.TableNo ?? null,
        name: table.Name,
        location: table.Location ?? '',
        seats: table.Seats,
        status: table.Status,
      }))
      .sort((a, b) => {
        const aNo = a.tableNo ?? a.id;
        const bNo = b.tableNo ?? b.id;
        return aNo - bNo;
      });
  }, [tables]);

  const tablePagination = useMemo(() => {
    const pageSize = 10;
    const total = tableRows.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const safePage = Math.min(tablePage, totalPages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return {
      pageSize,
      total,
      totalPages,
      page: safePage,
      items: tableRows.slice(start, end),
    };
  }, [tableRows, tablePage]);

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
      tableNo: table.tableNo ?? '',
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

  const navItems = [
    { key: 'metrics', label: 'Thống kê', icon: MdOutlineAnalytics },
    { key: 'categories', label: 'Quản lý danh mục', icon: BiCategoryAlt },
    { key: 'tables', label: 'Quản lý bàn', icon: MdTableBar },
    { key: 'products', label: 'Quản lý sản phẩm', icon: BiSolidDish },
    { key: 'orders', label: 'Quản lý đơn hàng', icon: MdOutlineReorder },
    { key: 'users', label: 'Quản lý người dùng', icon: MdPeople },
    { key: 'promos', label: 'Quản lý mã giảm giá', icon: MdLocalOffer },
  ];

  return (
    <section className="flex bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
      <aside className="w-72 bg-[#1a1a1a] border-r border-[#2b2b2b] px-4 py-6">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-[#2b2a2a] text-[#f5f5f5]' : 'text-[#ababab] hover:text-[#f5f5f5]'
                }`}
              >
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 px-8 py-6 pb-20 flex flex-col gap-6 min-h-0 overflow-hidden">

        {tab === 'categories' && (
          <div className="bg-[#2b2a2a] rounded-2xl p-6 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#f5f5f5] text-lg font-semibold">Quản lý danh mục</h2>
              <button
                onClick={openCreateCategory}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#f6b100] text-[#1a1a1a] hover:bg-[#d69a03]"
              >
                Thêm danh mục
              </button>
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
                  {categoryRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[#ababab]">
                        Chưa có danh mục.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {categoryRows.length > 0 && (
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
          </div>
        )}

        {tab === 'metrics' && (
          <div className="flex gap-6 min-h-0">
            <div className="flex-3 flex flex-col min-h-0">
              <div className="flex items-start">
                <Greetings />
                <div className="flex h-full bg-[#1a1a1a] rounded-xl px-3 py-2 ">
                  <select
                    value={rangeKey}
                    onChange={(e) => setRangeKey(e.target.value)}
                    className="bg-[#1a1a1a] text-[#f5f5f5] text-sm font-semibold outline-none"
                  >
                    <option value="today">Hôm nay</option>
                    <option value="month">Tháng này</option>
                    <option value="quarter">Quý này</option>
                    <option value="year">Năm nay</option>
                    <option value="all">Tất cả</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center w-full gap-3 px-0 mt-4 py-3">
                <MiniCard title="Tổng thu nhập" icon={<BsCashCoin />} 
                  value={totalEarning} increaseRate={0} color="bg-[#02ca3a]"></MiniCard>
                <MiniCard title="Đang tiến hành" icon={<GrInProgress />} 
                  value={inProgressCount} increaseRate={0} color="bg-[#f6b100]"></MiniCard>
                <MiniCard title="Danh sách chờ" icon={<CiViewList />} 
                  value={waitingCount} increaseRate={0} color="bg-[#025cca]"></MiniCard>
              </div>
              <div className="flex-1 flex w-full gap-3 min-h-0">
                <PopularDishes items={popular} />
                <OutOfStock items={outOfStock} />
              </div>
            </div>
            <div className="flex-2 flex flex-col min-h-0">
              <ProgressAndPayment orders={filteredOrders} />
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="bg-[#2b2a2a] rounded-2xl p-6">
            <h2 className="text-[#f5f5f5] text-lg font-semibold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[#ababab]">
                  <tr>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Khách hàng</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3">Ngày &amp; giờ</th>
                    <th className="py-3 px-3">Món</th>
                    <th className="py-3 px-3">Bàn</th>
                    <th className="py-3 px-3">Tổng</th>
                    <th className="py-3 px-3">Thanh toán</th>
                  </tr>
                </thead>
                <tbody className="text-[#f5f5f5]">
                  {orders.map((order) => {
                    const currentStatus =
                      statusOverrides[order.Id] ??
                      (statusOptions.some((opt) => opt.value === order.Status)
                        ? order.Status
                        : 'pending');
                    const statusMeta = getStatusMeta(currentStatus);
                    const payment = paymentByOrder.get(order.Id);
                    return (
                      <tr key={order.Id} className="border-t border-[#3a3a3a]">
                        <td className="py-3 px-3">#{order.Id}</td>
                        <td className="py-3 px-3">
                          {order.CreatedByName || 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(order.Id, e.target.value)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              statusMeta.bg
                            } ${statusMeta.color} outline-none`}
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          {formatDateTime(order.CreatedAt)}
                        </td>
                        <td className="py-3 px-3">{order.ItemCount ?? 0} món</td>
                        <td className="py-3 px-3">{order.TableName || `Bàn ${order.TableId ?? '-'}`}</td>
                        <td className="py-3 px-3">{formatCurrency(order.Total)}</td>
                        <td className="py-3 px-3">
                          {payment?.Method ? payment.Method : 'Chưa thanh toán'}
                        </td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-[#ababab]">
                        Chưa có đơn gần đây.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="bg-[#2b2a2a] rounded-2xl p-6">
            <h2 className="text-[#f5f5f5] text-lg font-semibold mb-4">Payments</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[#ababab]">
                  <tr>
                    <th className="py-3 px-3">Payment ID</th>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Phương thức</th>
                    <th className="py-3 px-3">Số tiền</th>
                    <th className="py-3 px-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="text-[#f5f5f5]">
                  {payments.map((payment) => (
                    <tr key={payment.Id} className="border-t border-[#3a3a3a]">
                      <td className="py-3 px-3">#{payment.Id}</td>
                      <td className="py-3 px-3">#{payment.OrderId}</td>
                      <td className="py-3 px-3">{payment.Method}</td>
                      <td className="py-3 px-3">{formatCurrency(payment.Amount)}</td>
                      <td className="py-3 px-3">{formatDateTime(payment.PaidAt)}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#ababab]">
                        Chưa có giao dịch thanh toán.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="bg-[#2b2a2a] rounded-2xl p-6 flex flex-col min-h-0 overflow-hidden flex-1 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#f5f5f5] text-lg font-semibold">Quản lý món ăn</h2>
              <button
                onClick={openAddProduct}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2563eb] text-white"
              >
                Thêm món ăn
              </button>
            </div>
            <div className="scrollbar-hide flex-1 min-h-0 overflow-y-auto overflow-x-auto flex flex-col pb-14">
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
                  {productPagination.items.map((item) => (
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
                        {item.StockQty === null || item.StockQty === undefined
                          ? 'N/A'
                          : `${item.StockQty} ${item.StockUnit || ''}`}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditProduct(item)}
                            className="px-3 py-1 rounded-md bg-[#2563eb] text-white text-xs"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item)}
                            className="px-3 py-1 rounded-md bg-[#3a3a3a] text-white text-xs"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {productPagination.total === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-[#ababab]">
                        Chưa có dữ liệu món ăn.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="absolute left-6 right-6 bottom-4 flex items-center justify-between text-sm text-[#ababab] border-t border-[#3a3a3a] pt-3 bg-[#2b2a2a]">
              <span>
                Hiển thị {productPagination.items.length} / {productPagination.total} món
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProductPage((prev) => Math.max(prev - 1, 1))}
                  disabled={productPagination.page <= 1}
                  className="px-3 py-1 rounded-md bg-[#1f1f1f] text-[#f5f5f5] disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="text-[#f5f5f5]">
                  {productPagination.page} / {productPagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setProductPage((prev) =>
                      Math.min(prev + 1, productPagination.totalPages),
                    )
                  }
                  disabled={productPagination.page >= productPagination.totalPages}
                  className="px-3 py-1 rounded-md bg-[#1f1f1f] text-[#f5f5f5] disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'tables' && (
          <div className="bg-[#2b2a2a] rounded-2xl p-6 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#f5f5f5] text-lg font-semibold">Quản lý bàn</h2>
              <button
                onClick={openAddTable}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2563eb] text-white"
              >
                + Thêm bàn
              </button>
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
        )}

        {tab === 'users' && (
          <div className="bg-[#2b2a2a] rounded-2xl p-6 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-[#f5f5f5] text-lg font-semibold">Quản lý người dùng</h2>
                <p className="text-[#8f8f8f] text-sm">Quản lý tài khoản theo dữ liệu người dùng.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg">
                  <span className="text-[#8f8f8f] text-sm">🔍</span>
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm kiếm người dùng..."
                    className="bg-transparent text-sm text-[#f5f5f5] outline-none"
                  />
                </div>
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
          </div>
        )}

        {tab === 'promos' && (
          <div className="bg-[#2b2a2a] rounded-2xl p-6 text-[#ababab]">
            Chức năng đang được phát triển.
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
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#2563eb] text-white disabled:opacity-60"
            >
              {productSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </Modal>

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
    </section>
  );
};

export default AdminMore;

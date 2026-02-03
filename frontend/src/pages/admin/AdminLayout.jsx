import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MdTableBar, MdOutlineAnalytics, MdOutlineReorder, MdPeople, MdLocalOffer } from 'react-icons/md';
import { BiSolidDish, BiCategoryAlt } from 'react-icons/bi';
import Header from '../../components/shared/Header';
import BottomNav from '../../components/shared/BottomNav';

const navItems = [
  { to: '/admin', label: 'Thống kê', icon: MdOutlineAnalytics, end: true },
  { to: '/admin/categories', label: 'Quản lý danh mục', icon: BiCategoryAlt },
  { to: '/admin/tables', label: 'Quản lý bàn', icon: MdTableBar },
  { to: '/admin/products', label: 'Quản lý sản phẩm', icon: BiSolidDish },
  { to: '/admin/orders', label: 'Quản lý đơn hàng', icon: MdOutlineReorder },
  { to: '/admin/users', label: 'Quản lý người dùng', icon: MdPeople },
  { to: '/admin/promos', label: 'Quản lý mã giảm giá', icon: MdLocalOffer },
];

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role') || 'staff';
    if (role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <>
      <Header />
      <section className="flex bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
        <aside className="w-72 bg-[#1a1a1a] border-r border-[#2b2b2b] px-4 py-6">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#2b2a2a] text-[#f5f5f5]' : 'text-[#ababab] hover:text-[#f5f5f5]'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </aside>

        <div className="flex-1 px-8 py-6 pb-28 flex flex-col gap-6 min-h-0 overflow-hidden">
          <Outlet />
        </div>
      </section>
      <BottomNav />
    </>
  );
};

export default AdminLayout;

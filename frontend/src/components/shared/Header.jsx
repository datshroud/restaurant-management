import React, { useEffect, useRef, useState } from 'react'
import logo from "../../assets/images/logo.png"
import {FaSearch, FaBell, FaUserCircle} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const [open, setOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [user, setUser] = useState({ name: 'Nhân viên', role: 'staff', phone: '' });
    const [search, setSearch] = useState('');
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const name = localStorage.getItem('displayName') || 'Nhân viên';
        const role = localStorage.getItem('role') || 'staff';
        const phone = localStorage.getItem('phone') || '';
        setUser({ name, role, phone });
    }, []);

    const refreshUser = () => {
        const name = localStorage.getItem('displayName') || 'Nhân viên';
        const role = localStorage.getItem('role') || 'staff';
        const phone = localStorage.getItem('phone') || '';
        setUser({ name, role, phone });
    };

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    useEffect(() => {
        const rawBase = import.meta.env.VITE_API_URL || '';
        if (!rawBase) return;
        const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
        const streamUrl = `${base}/notifications/stream`;
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
            if (!event?.data) return;
            let payload;
            try {
                payload = JSON.parse(event.data);
            } catch {
                return;
            }
            if (!payload?.id || !payload?.orderId) return;
            setNotifications((prev) => {
                if (prev.some((n) => n.id === payload.id)) return prev;
                const next = [
                    {
                        ...payload,
                        read: false,
                        createdAt: payload.createdAt || new Date().toISOString(),
                    },
                    ...prev,
                ];
                return next.slice(0, 50);
            });
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const formatRelativeTime = (iso) => {
        const createdAt = new Date(iso);
        const diff = Date.now() - createdAt.getTime();
        if (!Number.isFinite(diff) || diff < 0) return 'vừa xong';
        if (diff < 60000) return 'vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        return `${Math.floor(diff / 86400000)} ngày trước`;
    };

    const formatPaymentMethod = (method) => {
        if (!method) return '';
        const normalized = String(method).toLowerCase();
        if (normalized === 'cash') return 'Tiền mặt';
        if (normalized === 'momo') return 'MoMo';
        if (normalized === 'vnpay') return 'VNPay';
        return method;
    };

    const handleOpenNotification = (notification) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
        );
        setNotifOpen(false);
        navigate('/orders', { state: { openOrderId: notification.orderId } });
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('displayName');
        localStorage.removeItem('role');
        localStorage.removeItem('phone');
        navigate('/auth');
    };
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-[#1a1a1a]
                        ">
        {/* logo */}
        <div className="flex items-center gap-2">
            <img src={logo} className="h-8 w-8" alt="restasty logo"/>
            <a href='/' 
                className='text-lg font-semibold text-[#f5f5f5]'>
                Restasty
            </a>
        </div>
        {/* search */}
        <div className='flex items-center gap-4 bg-[#1f1f1f] rounded-[15px]
                        px-5 py-2 w-[500px]'>
            <FaSearch className="text-[#f5f5f5]" />
            <input
                type='search'
                name='search'
                autoComplete='off'
                placeholder='Tìm kiếm'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='bg-[#1f1f1f] outline-none text-[#f5f5f5] flex-1'
            />
        </div>
        {/* usericon */}
        <div className='flex items-center gap-4'>   
            <div className='relative' ref={notifRef}>
                <button
                    onClick={() => setNotifOpen((prev) => !prev)}
                    className='bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer relative'
                >
                    <FaBell className='text-2xl text-[#f5f5f5]'/>
                    {unreadCount > 0 && (
                        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center'>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
                {notifOpen && (
                    <div className='absolute right-0 mt-3 w-96 bg-[#1f1f1f] rounded-lg shadow-lg p-4 z-50'>
                        <div className='flex items-center justify-between mb-3'>
                            <p className='text-[#f5f5f5] font-semibold'>Thông báo</p>
                            <div className='flex items-center gap-3 text-xs text-[#ababab]'>
                                <button
                                    onClick={markAllRead}
                                    className='hover:text-[#f6b100]'
                                >
                                    Đánh dấu đã đọc
                                </button>
                                <button
                                    onClick={clearAll}
                                    className='hover:text-[#f6b100]'
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                        </div>
                        <div className='flex flex-col gap-3 max-h-96 overflow-y-auto scrollbar-hide'>
                            {notifications.length === 0 ? (
                                <p className='text-[#ababab] text-sm'>Chưa có thông báo.</p>
                            ) : (
                                notifications.map((notification) => {
                                    const tableLabel = Array.isArray(notification.tableIds) && notification.tableIds.length
                                        ? `Bàn ${notification.tableIds.join(', ')}`
                                        : '';
                                    const title = notification.type === 'order_created'
                                        ? 'Đơn hàng mới'
                                        : notification.type === 'order_updated'
                                            ? 'Đơn hàng được cập nhật'
                                            : notification.type === 'order_paid'
                                                ? 'Đơn hàng đã thanh toán'
                                                : 'Thông báo đơn hàng';
                                    const amount = Number(notification.total ?? 0);
                                    const amountLabel = Number.isFinite(amount) && amount > 0
                                        ? amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                                        : '';
                                    const methodLabel = formatPaymentMethod(notification.method);
                                    return (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleOpenNotification(notification)}
                                            className={`text-left w-full border border-[#2c2c2c] rounded-lg p-3 bg-[#1a1a1a] hover:bg-[#242424] ${notification.read ? 'opacity-70' : ''}`}
                                        >
                                            <div className='flex items-start justify-between gap-2'>
                                                <div>
                                                    <p className='text-[#f5f5f5] text-sm font-semibold'>{title}</p>
                                                    <p className='text-[#ababab] text-xs mt-1'>
                                                        #{notification.orderId}{tableLabel ? ` • ${tableLabel}` : ''}
                                                    </p>
                                                    {amountLabel && (
                                                        <p className='text-[#ababab] text-xs mt-1'>
                                                            Tổng: {amountLabel}
                                                        </p>
                                                    )}
                                                    {methodLabel && (
                                                        <p className='text-[#ababab] text-xs mt-1'>
                                                            Thanh toán: {methodLabel}
                                                        </p>
                                                    )}
                                                    <p className='text-[#5a5a5a] text-xs mt-2'>
                                                        {formatRelativeTime(notification.createdAt)}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <span className='mt-1 h-2 w-2 bg-red-500 rounded-full' />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className='relative' ref={dropdownRef}>
                <div
                    onClick={() => setOpen((prev) => !prev)}
                    className='flex gap-3 item-center cursor-pointer'
                >
                    <FaUserCircle className='text-4xl text-[#f5f5f5]'/>
                    <div className='flex flex-col items-start'>
                        <h1 className='text-[#f5f5f5] font-semibold'>{user.name}</h1>
                        <p className='text-[#ababab] text-xs font-medium'>
                            {user.role === 'admin'
                                ? 'Quản trị'
                                : user.role === 'cashier'
                                    ? 'Thu ngân'
                                    : user.role === 'waiter'
                                        ? 'Phục vụ'
                                        : 'Nhân viên'}
                        </p>
                    </div>
                </div>
                {open && (
                    <div className='absolute right-0 mt-3 w-56 bg-[#1f1f1f] rounded-lg shadow-lg p-4 z-50'>
                        <p className='text-[#f5f5f5] font-semibold'>{user.name}</p>
                        <p className='text-[#ababab] text-sm'>
                            {user.role === 'admin'
                                ? 'Quản trị'
                                : user.role === 'cashier'
                                    ? 'Thu ngân'
                                    : user.role === 'waiter'
                                        ? 'Phục vụ'
                                        : 'Nhân viên'}
                        </p>
                        {user.phone && (
                            <p className='text-[#ababab] text-xs mt-1'>{user.phone}</p>
                        )}
                        <div className='h-px bg-[#2c2c2c] my-3' />
                        <button
                            onClick={() => {
                                setOpen(false);
                                navigate('/account');
                            }}
                            className='w-full text-left text-[#f5f5f5] hover:text-[#f6b100] mb-2'
                        >
                            Thông tin tài khoản
                        </button>
                        <button
                            onClick={handleLogout}
                            className='w-full text-left text-[#f6b100] hover:text-[#f5f5f5]'
                        >
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </div>
    </header>
  )
}   

export default Header

import React, { useEffect, useMemo, useState } from 'react';
import api from '../../https/api';

const statusOptions = [
  { value: 'pending', label: 'Chờ xử lý', color: 'text-[#d1d1d1]', bg: 'bg-[#2c2c2c]' },
  { value: 'progress', label: 'Đang xử lý', color: 'text-[#f6b100]', bg: 'bg-[#51432a]' },
  { value: 'ready', label: 'Sẵn sàng', color: 'text-[#02ca3a]', bg: 'bg-[#1f3d2a]' },
  { value: 'completed', label: 'Hoàn thành', color: 'text-[#61dafb]', bg: 'bg-[#1c2a33]' },
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

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    const load = async () => {
      const [ordersRes, paymentsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/payments'),
      ]);
      setOrders(ordersRes.data ?? []);
      setPayments(paymentsRes.data ?? []);
    };

    load();
  }, []);

  const paymentByOrder = useMemo(() => {
    const map = new Map();
    payments.forEach((payment) => {
      if (!payment?.OrderId) return;
      map.set(payment.OrderId, payment);
    });
    return map;
  }, [payments]);

  const filteredOrders = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    let list = orders ?? [];

    if (statusFilter !== 'all') {
      list = list.filter((order) => {
        const currentStatus =
          statusOverrides[order.Id] ??
          (statusOptions.some((opt) => opt.value === order.Status)
            ? order.Status
            : 'pending');
        return currentStatus === statusFilter;
      });
    }
    if (paymentFilter !== 'all') {
      list = list.filter((order) => {
        const payment = paymentByOrder.get(order.Id);
        const paid = Boolean(payment?.Method);
        return paymentFilter === 'paid' ? paid : !paid;
      });
    }
    if (keyword) {
      list = list.filter((order) => {
        const customer = String(order.CreatedByName || '').toLowerCase();
        const table = String(order.TableName || `Bàn ${order.TableId ?? ''}`).toLowerCase();
        return (
          customer.includes(keyword) ||
          table.includes(keyword) ||
          String(order.Id).includes(keyword)
        );
      });
    }

    const sorted = [...list].sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'total') return (Number(a.Total ?? 0) - Number(b.Total ?? 0)) * direction;
      if (sortKey === 'id') return (a.Id - b.Id) * direction;
      const leftDate = new Date(a.CreatedAt || 0).getTime();
      const rightDate = new Date(b.CreatedAt || 0).getTime();
      return (leftDate - rightDate) * direction;
    });
    return sorted;
  }, [orders, searchKeyword, statusFilter, paymentFilter, sortKey, sortDir, paymentByOrder, statusOverrides]);

  const getStatusMeta = (status) =>
    statusOptions.find((opt) => opt.value === status) || statusOptions[0];

  const handleStatusChange = (orderId, nextStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [orderId]: nextStatus }));
  };

  return (
    <div className="bg-[#2b2a2a] rounded-2xl p-6">
      <div className="flex flex-col gap-3 mb-4">
        <h2 className="text-[#f5f5f5] text-lg font-semibold">Quản lý đơn hàng</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg">
            <span className="text-[#8f8f8f] text-sm">🔍</span>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm đơn hàng..."
              className="bg-transparent text-sm text-[#f5f5f5] outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="bg-[#1f1f1f] text-sm text-[#f5f5f5] px-3 py-2 rounded-lg outline-none"
          >
            <option value="date">Sắp xếp: Ngày</option>
            <option value="total">Sắp xếp: Tổng</option>
            <option value="id">Sắp xếp: Mã</option>
          </select>
          <button
            onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-2 rounded-lg text-sm bg-[#1f1f1f] text-[#f5f5f5]"
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
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
            {filteredOrders.map((order) => {
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
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-[#ababab]">
                  Không có đơn hàng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;

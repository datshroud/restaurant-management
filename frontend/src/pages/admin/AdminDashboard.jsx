import React, { useEffect, useMemo, useState } from 'react';
import { BsCashCoin } from 'react-icons/bs';
import { GrInProgress } from 'react-icons/gr';
import { CiViewList } from 'react-icons/ci';
import Greetings from '../../components/home/Greetings';
import MiniCard from '../../components/home/MiniCard';
import PopularDishes from '../../components/home/PopularDishes';
import OutOfStock from '../../components/home/OutOfStock';
import ProgressAndPayment from '../../components/home/ProgressAndPayment';
import api from '../../https/api';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    Number(value || 0),
  );

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

const AdminDashboard = () => {
  const [rangeKey, setRangeKey] = useState('today');
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [popular, setPopular] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, paymentsRes, popularRes, outRes] = await Promise.all([
        api.get('/orders'),
        api.get('/payments'),
        api.get('/menu/popular?limit=5'),
        api.get('/menu/out-of-stock?limit=5'),
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
    };

    load();
  }, [rangeKey]);

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

  return (
    <div className="flex gap-6 min-h-0">
      <div className="flex-[3] flex flex-col min-h-0">
        <div className="flex items-start">
          <Greetings />
          <div className="flex h-full bg-[#1a1a1a] rounded-xl px-3 py-2">
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
      <div className="flex-[2] flex flex-col min-h-0">
        <ProgressAndPayment orders={filteredOrders} />
      </div>
    </div>
  );
};

export default AdminDashboard;

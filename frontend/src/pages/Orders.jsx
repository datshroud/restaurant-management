import React, { useEffect, useMemo, useState } from 'react'
import OrderCard from '../components/orders/OrderCard'
import OrderDetailModal from '../components/orders/OrderDetailModal'
import PaymentModal from '../components/orders/PaymentModal'
import PaymentSuccessModal from '../components/orders/PaymentSuccessModal'
import api from '../https/api'
import { useLocation, useNavigate } from 'react-router-dom'
const Orders = () => {
  const [statusType, setStatusType] = useState("all");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [isSuccessOpen, setSuccessOpen] = useState(false);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const normalizeOrder = (order) => {
    if (!order) return order;
    let tableIds = [];
    if (Array.isArray(order.tableIds) && order.tableIds.length) {
      tableIds = order.tableIds;
    } else if (Array.isArray(order.tables) && order.tables.length) {
      tableIds = order.tables.map((t) => Number(t.Id)).filter((id) => Number.isFinite(id) && id > 0);
    } else if (typeof order.TableIds === 'string' && order.TableIds.trim()) {
      tableIds = order.TableIds.split(',')
        .map((part) => Number(part.trim()))
        .filter((id) => Number.isFinite(id) && id > 0);
    } else if (order.TableId) {
      tableIds = [Number(order.TableId)];
    }

    let tableNames = [];
    if (Array.isArray(order.tableNames) && order.tableNames.length) {
      tableNames = order.tableNames;
    } else if (Array.isArray(order.tables) && order.tables.length) {
      tableNames = order.tables.map((t) => t.Name || (t.TableNo ? `Bàn ${t.TableNo}` : `Bàn ${t.Id}`));
    } else if (typeof order.TableNames === 'string' && order.TableNames.trim()) {
      tableNames = order.TableNames.split(',').map((name) => name.trim()).filter(Boolean);
    } else if (order.TableName) {
      tableNames = [order.TableName];
    } else if (tableIds.length) {
      tableNames = tableIds.map((id) => `Bàn ${id}`);
    }

    return { ...order, tableIds, tableNames };
  };

  const load = async () => {
    const res = await api.get('/orders');
    const data = (res.data ?? []).map(normalizeOrder);
    setOrders(data);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const openOrderId = location.state?.openOrderId;
    if (!openOrderId) return;
    const id = Number(openOrderId);
    if (!Number.isFinite(id) || id <= 0) {
      navigate('/orders', { replace: true, state: null });
      return;
    }

    const openFromNotification = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data?.Id) {
          setSelectedOrder(normalizeOrder(res.data));
          setDetailOpen(true);
        }
      } catch {
        // ignore
      } finally {
        navigate('/orders', { replace: true, state: null });
      }
    };

    openFromNotification();
  }, [location.state?.openOrderId, navigate]);

  const filteredOrders = useMemo(() => {
    if (statusType === 'all') return orders;
    if (statusType === 'progress') return orders.filter((o) => o.Status === 'progress');
    if (statusType === 'ready') return orders.filter((o) => o.Status === 'ready');
    if (statusType === 'completed') return orders.filter((o) => o.Status === 'completed');
    return orders;
  }, [orders, statusType]);
  return (
    
    <div className='flex flex-col px-8 py-4 bg-[#1f1f1f] h-[calc(100vh-5rem)]
                    pb-28'>
      <div className='flex justify-between items-center'>
        <h1 className='text-[#f5f5f5] text-3xl font-semibold'>
          Yêu cầu
        </h1>
        <div className='flex items-center gap-2'>
          <button onClick={() => setStatusType("all")} className={`
                      ${statusType === "all" ? "bg-[#414040]" : ""} 
                      text-[#ababab] text-lg px-3 py-3 font-semibold 
                      cursor-pointer rounded-lg`}>
            Tất cả
          </button>
          <button onClick={() => setStatusType("progress")} className={`
                      ${statusType === "progress" ? "bg-[#414040]" : ""} 
                      text-[#ababab] text-lg px-3 py-3 font-semibold 
                      cursor-pointer rounded-lg`}>
            Đang tiến hành
          </button>
          <button onClick={() => setStatusType("ready")} className={`
                      ${statusType === "ready" ? "bg-[#414040]" : ""} 
                      text-[#ababab] text-lg px-3 py-3 font-semibold 
                      cursor-pointer rounded-lg`}>
            Đã sẵn sàng
          </button>
          <button onClick={() => setStatusType("completed")} className={`
                      ${statusType === "completed" ? "bg-[#414040]" : ""} 
                      text-[#ababab] text-lg px-3 py-3 font-semibold 
                      cursor-pointer rounded-lg`}>
            Hoàn thành
          </button>
        </div>
      </div>
      <div className='grid grid-cols-3 gap-10 py-4 flex-1 min-h-0 
                    h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide'>
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.Id}
            order={order}
            onOpenDetail={(o) => {
              setSelectedOrder(o);
              setDetailOpen(true);
            }}
            onPay={(o) => {
              setSelectedOrder(o);
              setPaymentOpen(true);
            }}
          />
        ))}
      </div>
        <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={() => setDetailOpen(false)}
        order={selectedOrder}
        onProcess={(o) => {
          setDetailOpen(false);
          setSelectedOrder(o);
          setPaymentOpen(true);
        }}
      />
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setPaymentOpen(false)}
        order={selectedOrder}
        onPaid={(payload) => {
          load();
          if (payload?.method === 'cash') {
            setSuccessOpen(true);
          }
        }}
      />
      <PaymentSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setSuccessOpen(false)}
        order={selectedOrder}
      />
    </div>
  )
}

export default Orders

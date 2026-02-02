import React, { useEffect, useMemo, useState } from 'react'
import OrderCard from '../components/orders/OrderCard'
import api from '../https/api'
const Orders = () => {
  const [statusType, setStatusType] = useState("all");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/orders');
      setOrders(res.data ?? []);
    };

    load();
  }, []);

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
          <OrderCard key={order.Id} order={order} />
        ))}
      </div>
    </div>
  )
}

export default Orders
import React, { useEffect, useMemo, useState } from 'react'
import Greetings from '../components/home/Greetings'
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard"
import { CiViewList } from "react-icons/ci";
import PopularDishes from '../components/home/PopularDishes';
import OutOfStock from '../components/home/OutOfStock';
import ProgressAndPayment from '../components/home/ProgressAndPayment';
import api from '../https/api';
const Home = () => {
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
  }, []);

  const totalEarning = useMemo(() =>
    (payments ?? []).reduce((sum, p) => sum + Number(p.Amount ?? 0), 0),
    [payments],
  );
  const inProgressCount = useMemo(() =>
    (orders ?? []).filter((o) => o.Status === 'progress').length,
    [orders],
  );
  const waitingCount = useMemo(() =>
    (orders ?? []).filter((o) => o.Status === 'pending').length,
    [orders],
  );

  return (
    <section className='flex bg-[#1f1f1f] h-[calc(100vh-5rem)] 
                        overflow-hidden pb-28'>
      <div className="flex-[3] bg-[#1f1f1f] flex flex-col min-h-0">
        <Greetings />
        <div className='flex items-center w-full gap-3 px-8 mt-4 py-3'>
          <MiniCard title="Tổng thu nhập" icon={<BsCashCoin />} 
            value={totalEarning} increaseRate={0} color="bg-[#02ca3a]"></MiniCard>
          <MiniCard title="Đang tiến hành" icon={<GrInProgress />} 
            value={inProgressCount} increaseRate={0} color="bg-[#f6b100]"></MiniCard>
          <MiniCard title="Danh sách chờ" icon={<CiViewList />} 
            value={waitingCount} increaseRate={0} color="bg-[#025cca]"></MiniCard>
        </div>
        <div className='flex-1 flex w-full gap-3 px-8 min-h-0'>
          <PopularDishes items={popular} />
          <OutOfStock items={outOfStock} />
        </div>
      </div>
        
      <div className="flex-[2] bg-[#1f1f1f] flex flex-col pr-6">
        <ProgressAndPayment orders={orders} />
      </div>
    </section>
  )
}

export default Home
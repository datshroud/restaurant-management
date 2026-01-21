import React from 'react'
import Greetings from '../components/home/Greetings'
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard"
import { CiViewList } from "react-icons/ci";
import PopularDishes from '../components/home/PopularDishes';
import OutOfStock from '../components/home/OutOfStock';
import ProgressAndPayment from '../components/home/ProgressAndPayment';
const Home = () => {
  return (
    <section className='flex bg-[#1f1f1f] h-[calc(100vh-5rem)] 
                        overflow-hidden pb-28'>
      <div className="flex-[3] bg-[#1f1f1f] flex flex-col min-h-0">
        <Greetings />
        <div className='flex items-center w-full gap-3 px-8 mt-4 py-3'>
          <MiniCard title="Tổng thu nhập" icon={<BsCashCoin />} 
            value={3600000} increaseRate={3.6} color="bg-[#02ca3a]"></MiniCard>
          <MiniCard title="Đang tiến hành" icon={<GrInProgress />} 
            value={30} increaseRate={1.6} color="bg-[#f6b100]"></MiniCard>
          <MiniCard title="Danh sách chờ" icon={<CiViewList />} 
            value={100} increaseRate={-1.6} color="bg-[#025cca]"></MiniCard>
        </div>
        <div className='flex-1 flex w-full gap-3 px-8 min-h-0'>
          <PopularDishes />
          <OutOfStock />
        </div>
      </div>
        
      <div className="flex-[2] bg-[#1f1f1f] flex flex-col pr-6">
        <ProgressAndPayment/>
      </div>
    </section>
  )
}

export default Home
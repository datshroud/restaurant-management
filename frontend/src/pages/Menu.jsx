import React from 'react'
import BackButton from '../components/shared/BackButton'
import { FaSearch } from "react-icons/fa";
import MenuContainer from '../components/menu/MenuContainer';
import OrderDetailContainer from '../components/menu/OrderDetailContainer';

const Menu = () => {
  return (
    <section className='flex bg-[#1f1f1f] h-[100vh] 
                        overflow-hidden min-h-0'>
        
        <div className='flex-[8] flex flex-col gap-4 px-8 py-6 min-h-0'>
            <div className='flex items-center justify-between'>
                <div className='flex gap-4 items-center'>
                    <BackButton />
                    <h1 className='text-[#f5f5f5] text-3xl font-semibold
                                    tracking-wide'>Menu</h1>
                </div>
                <div className='flex items-center gap-4 bg-[#363636] rounded-[15px]
                                        px-5 py-4 w-[500px]'>
                    <FaSearch className="text-[#f5f5f5]" />
                    <input
                        type='text'
                        placeholder='Tìm kiếm'
                        className='bg-[#363636] outline-none text-[#f5f5f5] flex-1'
                    />
                </div>
            </div>
            <MenuContainer/>
        </div>
            
        <div className="flex-[3] bg-[#1f1f1f] flex flex-col gap-4 px-4 py-6">
            <OrderDetailContainer/>
        </div>
    </section>
  )
}

export default Menu
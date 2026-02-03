import React, { useState } from 'react'
import BackButton from '../components/shared/BackButton'
import { FaSearch } from "react-icons/fa";
import MenuContainer from '../components/menu/MenuContainer';
import OrderDetailContainer from '../components/menu/OrderDetailContainer';
import { useLocation } from 'react-router-dom';

const Menu = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const location = useLocation();
    const isReadOnly = Boolean(location.state?.readOnly);

  return (
    <section className='flex bg-[#1f1f1f] h-[100vh] 
                        overflow-hidden min-h-0'>
        
        <div className='flex-[8] flex flex-col gap-4 px-8 py-6 min-h-0'>
            <div className='flex items-center justify-between'>
                <div className='flex gap-4 items-center'>
                    <BackButton />
                    <h1 className='text-[#f5f5f5] text-3xl font-semibold
                                    tracking-wide'>Thực đơn</h1>
                </div>
                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-4 bg-[#363636] rounded-[15px]
                                            px-5 py-4 w-[420px]'>
                        <FaSearch className="text-[#f5f5f5]" />
                        <input
                            type='text'
                            placeholder='Tìm kiếm'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='bg-[#363636] outline-none text-[#f5f5f5] flex-1'
                        />
                    </div>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className='bg-[#363636] text-[#f5f5f5] rounded-[12px] px-4 py-3 outline-none'
                    >
                        <option value='asc'>Giá tăng dần</option>
                        <option value='desc'>Giá giảm dần</option>
                    </select>
                </div>
            </div>
                        <MenuContainer searchTerm={searchTerm} sortOrder={sortOrder} readOnly={isReadOnly} />
        </div>
            
        <div className="flex-[3] bg-[#1f1f1f] flex flex-col gap-4 px-4 py-6 min-h-0">
                        <OrderDetailContainer readOnly={isReadOnly} />
        </div>
    </section>
  )
}

export default Menu
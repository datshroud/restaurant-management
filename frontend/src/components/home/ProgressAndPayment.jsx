import React from 'react'
import {FaSearch} from 'react-icons/fa';
import ProgressList from './ProgressList';

const ProgressAndPayment = () => {
  return (
    <div className='flex flex-col bg-[#1a1a1a]
                    gap-6 px-4 py-4 mt-5 rounded-lg flex-1 min-h-0'>
        <div className='flex bg-[#1f1f1f] rounded-lg'>
            <button className='flex-1 rounded-lg px-4 py-4 flex justify-center
                                bg-[#262626] cursor-pointer'>
                <p className='text-[#f5f5f5] font-semibold'>Đang xử lí</p>
            </button>
            <button className='flex-1 rounded-lg px-4 py-4 flex 
                                justify-center cursor-pointer'>
                <p className='text-[#f5f5f5] font-semibold'>Chờ thanh toán</p>
            </button>
        </div>
        <div className='flex items-center gap-4 bg-[#1f1f1f] rounded-[15px]
                        px-5 py-3'>
            <FaSearch className="text-[#f5f5f5]" />
            <input
                type='text'
                placeholder='Tìm kiếm'
                className='bg-[#1f1f1f] outline-none text-[#f5f5f5] flex-1'
            />
        </div>
        <ProgressList/>
    </div>
  )
}

export default ProgressAndPayment
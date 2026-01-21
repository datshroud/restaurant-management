import React from 'react'
import { FaCheckDouble } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";

const OrderCard = () => {
  return (
    <div className='flex flex-col gap-4 bg-[#363636] px-4 py-4 rounded-lg'>
        <div className='flex justify-between items-center'>
            <div className='flex gap-3'>
                <div className='flex h-[50px] w-[50px] items-center 
                                justify-center bg-[#f6b100] rounded-lg'>
                    <p className='text-lg font-semibold'>A1</p>
                </div>
                <div>
                    <h1 className='text-[#f5f5f5] text-lg 
                                    font-semibold tracking-wide'>
                        Nhân viên 1
                    </h1>
                    <p className='text-[#ababab] text-sm'>
                        #36 / Dùng tại bàn
                    </p>
                </div>
            </div>
            <div className='flex flex-col items-end gap-1'>
                <div className='px-1 py-1 bg-[#2c4c3f] 
                        rounded-lg w-fit'>
                    
                    <p className='text-green-600 text-sm'>
                        <FaCheckDouble className='inline mr-2'/>
                        Sẵn sàng
                    </p>
                </div>
                <p className='text-[#f5f5f5] text-xs'>
                    <FaCircle className='text-green-600
                                        text-xs inline mr-2'/>
                    Sẵn sàng phục vụ
                </p>
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <p className='text-[#ababab]'>January 21, 2026</p>
            <p className='text-[#f5f5f5] font-semibold tracking-wide'>
                36 mặt hàng
            </p>
        </div>
        <hr className='text-[#ababab]'></hr>
        <div className='flex items-center justify-between'>
            <p className='text-[#f5f5f5] font-semibold tracking-wide'>
                Tổng tiền:
            </p>
            <p className='text-[#f5f5f5] font-semibold tracking-wide'>
                360.000 đ
            </p>
        </div>
    </div>
  )
}

export default OrderCard
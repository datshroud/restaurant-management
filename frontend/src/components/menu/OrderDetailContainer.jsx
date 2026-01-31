import React from 'react'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'
import { formatDate, formatTime, getAvatarName } from '../../utils';
import { useState } from 'react';

const OrderDetailContainer = () => {
    const customerData = useSelector((state) => state.customer);
    const cartData = useSelector((state) => state.cart);
    const [dateTime, setDateTime] = useState(new Date());
  return (
    <div className='flex-1 rounded-xl bg-[#1a1a1a] flex flex-col shadow-lg '>
        {/* Customer Info */}
        <div className='flex flex-col gap-2 px-6 py-6'>
            <h1 className='text-2xl text-[#f5f5f5] font-semibold'> 
                Thông tin khách hàng 
            </h1>
            <div className='flex gap-3 items-center justify-between'>
                <div>
                    <h1 className='text-[#f5f5f5] text-lg 
                                    font-semibold tracking-wide'>
                        {customerData.customerName || "N/A"} 
                    </h1>
                    <p className='text-[#ababab] text-sm'>
                        #{customerData.orderId || "N/A"} / Dùng tại bàn
                    </p>
                </div>
                <div className='flex h-[50px] w-[50px] items-center 
                                justify-center bg-[#f6b100] rounded-lg'>
                    <p className='text-lg font-semibold'>
                        {getAvatarName(customerData.customerName) || "N/A"}
                    </p>
                </div>
            </div>
            <p className='text-[#ababab]'>{formatDate(dateTime)} | {formatTime(dateTime)}</p>
            
        </div>
        <hr className='border-t-3 border-[#1f1f1f]' />
        {/* Order detail */}
        <div className='flex flex-col px-6 py-6'>
            <h1 className='text-2xl text-[#f5f5f5] font-semibold'> 
                Chi tiết yêu cầu
            </h1>
            {
                Object.values(cartData).length === 0 ? (
                    <p className='text-[#ababab] mt-4'>
                        Chưa có món nào được thêm vào
                    </p>
                ) : (
                    Object.values(cartData).map((item) => (
                        <ProductCard key={item.id} item={item} />
                    ))
                )
            }
        </div>
    </div>
  )
}

export default OrderDetailContainer
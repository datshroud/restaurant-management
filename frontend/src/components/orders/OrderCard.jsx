import React from 'react'
import { FaCheckDouble } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDate } from '../../utils';

const OrderCard = ({ order }) => {
    const status = order?.Status ?? 'pending';
    const statusLabel = status === 'ready' ? 'Sẵn sàng' :
        status === 'completed' ? 'Hoàn thành' :
        status === 'progress' ? 'Đang tiến hành' : 'Đang chờ';
    const statusColor = status === 'ready' ? 'text-green-600' :
        status === 'completed' ? 'text-blue-500' :
        status === 'progress' ? 'text-yellow-500' : 'text-[#f6b100]';
    const statusBg = status === 'ready' ? 'bg-[#2c4c3f]' :
        status === 'completed' ? 'bg-[#263b5a]' :
        status === 'progress' ? 'bg-[#51432a]' : 'bg-[#2c2c2c]';
    const createdAt = order?.CreatedAt ? new Date(order.CreatedAt) : null;
    const total = order?.Total ?? 0;
  return (
    <div className='flex flex-col gap-4 bg-[#2b2a2a] px-4 py-4 rounded-2xl
                    shadow-lg cursor-pointer'>
        <div className='flex justify-between items-center'>
            <div className='flex gap-3'>
                <div className='flex h-[50px] w-[50px] items-center 
                                justify-center bg-[#f6b100] rounded-lg'>
                    <p className='text-lg font-semibold'>T{order?.TableId ?? '-'}</p>
                </div>
                <div>
                    <h1 className='text-[#f5f5f5] text-lg 
                                    font-semibold tracking-wide'>
                        Đơn #{order?.Id ?? '-'}
                    </h1>
                    <p className='text-[#ababab] text-sm'>
                        Dùng tại bàn
                    </p>
                </div>
            </div>
            <div className='flex flex-col items-end gap-1'>
                <div className={`px-1 py-1 ${statusBg} 
                        rounded-lg w-fit'>
                    
                    <p className={`${statusColor} text-sm`}>
                        <FaCheckDouble className='inline mr-2'/>
                        {statusLabel}
                    </p>
                </div>
                <p className='text-[#f5f5f5] text-xs'>
                    <FaCircle className={`${statusColor} text-xs inline mr-2`}/>
                    {statusLabel}
                </p>
            </div>
        </div>
        <div className='flex items-center justify-between'>
            <p className='text-[#ababab]'>
                {createdAt ? formatDate(createdAt) : 'N/A'}
            </p>
            <p className='text-[#f5f5f5] font-semibold tracking-wide'>
                {order?.Total ? 'Đã tính tổng' : 'Chưa tính tổng'}
            </p>
        </div>
        <hr className='text-[#ababab]'></hr>
        <div className='flex items-center justify-between'>
            <p className='text-[#f5f5f5] font-semibold tracking-wide'>
                Tổng tiền:
            </p>
            <p className='text-[#f5f5f5] font-semibold tracking-wide'>
                {Number(total).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </p>
        </div>
    </div>
  )
}

export default OrderCard
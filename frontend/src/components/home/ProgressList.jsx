import React from 'react'
import { FaCheckDouble } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";

const ProgressList = ({ orders = [] }) => {
    return (
        <div className='flex-1 flex flex-col gap-6 min-h-0 overflow-y-scroll
                        scrollbar-hide'>
            {orders.length === 0 && (
                <p className='text-[#ababab] text-sm'>Không có dữ liệu.</p>
            )}
            {orders.map((order) => (
                <div key={order.Id} className='flex justify-between items-center'>
                    <div className='flex gap-3'>
                        <div className='flex h-[50px] w-[50px] items-center 
                                        justify-center bg-[#f6b100] rounded-lg'>
                            <p className='text-lg font-semibold'>
                                {order.TableName || (order.TableId ? `T${order.TableId}` : 'NA')}
                            </p>
                        </div>
                        <div>
                            <h1 className='text-[#f5f5f5] text-lg 
                                            font-semibold tracking-wide'>
                                Đơn #{order.Id}
                            </h1>
                            <p className='text-[#ababab] text-sm'>
                                Mặt hàng: {order.ItemCount ?? 0}
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                        <div className='px-1 py-1 bg-[#2c4c3f] 
                                rounded-lg w-fit'>
                            
                            <p className='text-green-600 text-sm'>
                                <FaCheckDouble className='inline mr-2'/>
                                {order.Status === 'progress' ? 'Đang làm' : 'Chờ thanh toán'}
                            </p>
                        </div>
                        <p className='text-[#f5f5f5] text-xs'>
                            <FaCircle className='text-green-900
                                               text-xs inline mr-2'/>
                            {order.Status === 'progress' ? 'Đang bếp' : 'Đợi thanh toán'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ProgressList
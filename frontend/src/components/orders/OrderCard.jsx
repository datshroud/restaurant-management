import React from 'react'
import { FaCheckDouble } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { formatDate } from '../../utils';

const OrderCard = ({ order, onPay, onOpenDetail }) => {
    const status = order?.Status ?? 'pending';
    const statusLabel = status === 'ready' ? 'Đang chờ' :
        status === 'completed' ? 'Hoàn thành' :
        status === 'progress' ? 'Đang tiến hành' : 'Đang chờ';
    const statusColor = status === 'ready' ? 'text-yellow-400' :
        status === 'completed' ? 'text-blue-400' :
        status === 'progress' ? 'text-yellow-400' : 'text-yellow-400';
    const statusBg = status === 'ready' ? 'bg-[#3a3420]' :
        status === 'completed' ? 'bg-[#263b5a]' :
        status === 'progress' ? 'bg-[#3a3420]' : 'bg-[#3a3420]';
    const createdAt = order?.CreatedAt ? new Date(order.CreatedAt) : null;
    const total = order?.Total ?? 0;
    const resolveTableIds = () => {
        if (Array.isArray(order?.tableIds) && order.tableIds.length) return order.tableIds;
        if (typeof order?.TableIds === 'string' && order.TableIds.trim()) {
            return order.TableIds.split(',')
                .map((part) => Number(part.trim()))
                .filter((id) => Number.isFinite(id) && id > 0);
        }
        return order?.TableId ? [order.TableId] : [];
    };

    const resolveTableNames = () => {
        if (Array.isArray(order?.tableNames) && order.tableNames.length) return order.tableNames;
        if (typeof order?.TableNames === 'string' && order.TableNames.trim()) {
            return order.TableNames.split(',').map((name) => name.trim()).filter(Boolean);
        }
        if (order?.TableName) return [order.TableName];
        const ids = resolveTableIds();
        return ids.map((id) => `Bàn ${id}`);
    };

    const tableNames = resolveTableNames();
    const tableLabel = tableNames.length ? tableNames.join(', ') : '-';
    const creatorName = order?.CreatedByName || 'Nhân viên';
    const itemCount = order?.ItemCount ?? 0;
    return (
        <div
                onClick={() => onOpenDetail?.(order)}
                className='flex flex-col gap-3 bg-[#2b2a2a] px-4 py-4 rounded-2xl
                                        shadow-lg cursor-pointer h-fit self-start'>
        <div className='flex justify-between items-start'>
            <div className='flex gap-3'>
                <div className='flex h-[50px] w-[50px] items-center 
                                justify-center bg-[#f6b100] rounded-lg'>
                    <p className='text-lg font-semibold'>
                        {creatorName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </p>
                </div>
                <div>
                    <h1 className='text-[#f5f5f5] text-lg font-semibold tracking-wide'>
                        {creatorName}
                    </h1>
                    <p className='text-[#ababab] text-sm'>
                        #{order?.Id ?? '-'} / Dùng tại bàn
                    </p>
                    <p className='text-[#ababab] text-sm'>
                        {tableLabel}
                    </p>
                </div>
            </div>
            <div className='flex flex-col items-end gap-1'>
                <div className={`px-2 py-1 ${statusBg} rounded-lg w-fit`}>
                    <p className={`${statusColor} text-xs font-semibold`}>
                        <FaCheckDouble className='inline mr-2'/>
                        {statusLabel}
                    </p>
                </div>
                <p className='text-[#f5f5f5] text-xs'>
                    <FaCircle className={`${statusColor} text-xs inline mr-2`}/>
                    {status === 'progress' ? 'Đang chuẩn bị' : 'Đang chờ'}
                </p>
            </div>
        </div>
        <div className='flex items-center justify-between text-[#ababab] text-sm'>
            <p>{createdAt ? formatDate(createdAt) : 'N/A'}</p>
            <p>{itemCount} món</p>
        </div>
        <hr className='text-[#3a3a3a]'></hr>
        <div className='flex items-center justify-between'>
            <p className='text-[#f5f5f5] font-semibold tracking-wide'>
                Tổng cộng
            </p>
            <p className='text-[#f5f5f5] font-semibold tracking-wide'>
                {Number(total).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </p>
        </div>
    </div>
  )
}

export default OrderCard

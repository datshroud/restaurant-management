import React from 'react'
import { getAvatarName } from '../../utils'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateTable } from '../../redux/slices/customerSlice';

const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();

const getStatusMeta = (status) => {
    const normalized = normalizeStatus(status);
    const isAvailable = ['available', 'trống', '1', 'có sẵn', 'empty'].includes(normalized);
    const isReserved = ['reserved', 'booked', 'đã đặt', 'đã đặt trước', '2'].includes(normalized);
    const isOccupied = ['occupied', 'dine in', 'dinein', 'ăn tại chỗ', 'đang dùng', 'đang phục vụ', 'đang sử dụng', '3', 'in use'].includes(normalized);

    if (isReserved) {
        return {
            label: 'Đã đặt trước',
            cardBg: '#3a2a2a',
            badgeBg: '#7a2f2f',
            badgeText: '#f87171',
            circleBg: '#7a2f2f',
            selectable: false,
        };
    }

    if (isOccupied) {
        return {
            label: 'Ăn tại chỗ',
            cardBg: '#1f3d2a',
            badgeBg: '#14532d',
            badgeText: '#22c55e',
            circleBg: '#14532d',
            selectable: false,
        };
    }

    if (isAvailable) {
        return {
            label: 'Trống',
            cardBg: '#2b2b2b',
            badgeBg: '#3a3a3a',
            badgeText: '#d1d5db',
            circleBg: '#3a3a3a',
            selectable: true,
        };
    }

    return {
        label: status || 'Không xác định',
        cardBg: '#2b2b2b',
        badgeBg: '#3a3a3a',
        badgeText: '#d1d5db',
        circleBg: '#3a3a3a',
        selectable: true,
    };
};

const TableCard = ({ table, onSelect, onOpen, selected = false, statusOverride }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const status = statusOverride ?? table.Status;
    const statusMeta = getStatusMeta(status);
    const staffName = table.CreatedByName || table.StaffName || table.EmployeeName || table.AssignedStaffName || '';
    const initial = statusMeta.label === 'Đã đặt trước' ? (getAvatarName(staffName) || 'NV') : 'N/A';
    const seats = table.Seats ?? table.seats ?? table.Capacity ?? table.capacity ?? 'Không xác định';

    const canClick = onSelect ? (statusMeta.selectable || selected) : Boolean(onOpen || statusMeta.selectable);

    const handleClick = (name) => {
        if (onSelect) {
            if (!statusMeta.selectable && !selected) return;
            onSelect(table);
            return;
        }
        if (onOpen) {
            onOpen(table);
            return;
        }
        if (!statusMeta.selectable) return;
        dispatch(updateTable({ tableNo: name, tableIds: [table.Id] }));
        navigate(`/tables/${table.Id}`);
    };

    return (
        <div
            onClick={() => handleClick(table.Name)}
            className={`flex flex-col px-4 py-4 h-fit rounded-lg shadow-lg
                        ${canClick ? 'cursor-pointer' : 'cursor-not-allowed'}
                        ${selected ? 'ring-2 ring-[#22c55e]' : ''}`}
            style={{ backgroundColor: statusMeta.cardBg }}>
            <div className='flex items-center justify-between'>
                <h1 className='text-[#f5f5f5] text-xl font-semibold tracking-wide'>
                    {table.Name}
                </h1>
                <div
                    className='px-2 py-2 rounded-lg'
                    style={{ backgroundColor: statusMeta.badgeBg, color: statusMeta.badgeText }}>
                    <p>{statusMeta.label}</p>
                </div>
            </div>
            <div className='flex justify-center items-center px-4 py-3 mb-2'>
                <div
                    className='flex justify-center items-center h-20 w-20 rounded-full'
                    style={{ backgroundColor: statusMeta.circleBg }}>
                    <h1 className='text-[#f5f5f5] text-2xl tracking-wide'>
                        {initial}
                    </h1>
                </div>
            </div>
            <p className='text-[#ababab] text-sm text-center'>Số ghế: {seats}</p>
        </div>
    )
}

export default TableCard

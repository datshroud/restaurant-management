import React, { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import api from '../../https/api';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setEditMode, setOrderId, updateTable } from '../../redux/slices/customerSlice';
import { clearCart } from '../../redux/slices/cartSlice';

const OrderDetailModal = ({ isOpen, onClose, order, onProcess }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orderDetail, setOrderDetail] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const loadItems = async () => {
            if (!isOpen || !order?.Id) {
                setItems([]);
                setOrderDetail(null);
                return;
            }
            setLoading(true);
            try {
                const res = await api.get(`/orders/${order.Id}`);
                setItems(res.data?.items ?? []);
                setOrderDetail(res.data ?? null);
            } catch {
                setItems([]);
                setOrderDetail(null);
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, [isOpen, order]);

    const resolveTableIds = (data) => {
        if (!data) return [];
        if (Array.isArray(data.tableIds) && data.tableIds.length) {
            return data.tableIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0);
        }
        if (Array.isArray(data.tables) && data.tables.length) {
            return data.tables
                .map((t) => Number(t.Id))
                .filter((id) => Number.isFinite(id) && id > 0);
        }
        if (typeof data.TableIds === 'string' && data.TableIds.trim()) {
            return data.TableIds.split(',')
                .map((part) => Number(part.trim()))
                .filter((id) => Number.isFinite(id) && id > 0);
        }
        const fallback = Number(data.TableId);
        return Number.isFinite(fallback) && fallback > 0 ? [fallback] : [];
    };

    const resolveTableNames = (data) => {
        if (!data) return [];
        if (Array.isArray(data.tableNames) && data.tableNames.length) return data.tableNames;
        if (Array.isArray(data.tables) && data.tables.length) {
            return data.tables.map((t) => t.Name || (t.TableNo ? `Bàn ${t.TableNo}` : `Bàn ${t.Id}`));
        }
        if (typeof data.TableNames === 'string' && data.TableNames.trim()) {
            return data.TableNames.split(',').map((name) => name.trim()).filter(Boolean);
        }
        if (data.TableName) return [data.TableName];
        const ids = resolveTableIds(data);
        return ids.map((id) => `Bàn ${id}`);
    };

    const handleEditOrder = () => {
        const detail = orderDetail ?? order;
        if (!detail?.Id) return;
        const tableIds = resolveTableIds(detail);
        if (!tableIds.length) return;
        const tableNames = resolveTableNames(detail);
        const primaryTableId = tableIds[0] ?? Number(detail?.TableId ?? 0);
        if (!primaryTableId) return;
        dispatch(setEditMode({ editMode: true }));
        dispatch(setOrderId({ orderId: String(detail.Id) }));
        dispatch(
            updateTable({
                tableNo: tableNames.join(', '),
                tableIds,
            }),
        );
        dispatch(clearCart());
        onClose?.();
        navigate(`/tables/${primaryTableId}`);
    };

    const detail = orderDetail ?? order;
    const resolvedTableLabel = (() => {
        const names = resolveTableNames(detail);
        if (names.length) return names.join(', ');
        if (detail?.TableId) return `Bàn ${detail.TableId}`;
        return 'Không xác định';
    })();

    return (
        <Modal title="Chi tiết đơn hàng" isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <div className='flex justify-between text-[#ababab]'>
                    <span>Mã hóa đơn</span>
                    <span className='text-[#f5f5f5] font-semibold'>#{detail?.Id ?? 'N/A'}</span>
                </div>
                <div className='flex justify-between text-[#ababab]'>
                    <span>Bàn</span>
                    <span className='text-[#f5f5f5] font-semibold'>
                        {resolvedTableLabel}
                    </span>
                </div>
                <div className='flex justify-between text-[#ababab]'>
                    <span>Tổng tiền</span>
                    <span className='text-[#f5f5f5] font-semibold'>
                        {Number(detail?.Total ?? 0).toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        })}
                    </span>
                </div>

                <div className='border-t border-[#2c2c2c] pt-3'>
                    <p className='text-[#f5f5f5] font-semibold mb-2'>Món đã gọi</p>
                    {loading ? (
                        <p className='text-[#ababab] text-sm'>Đang tải...</p>
                    ) : items.length === 0 ? (
                        <p className='text-[#ababab] text-sm'>Không có dữ liệu món.</p>
                    ) : (
                        <div className='flex flex-col gap-2 max-h-56 overflow-y-auto scrollbar-hide'>
                            {items.map((item) => (
                                <div key={item.Id} className='flex justify-between text-[#ababab] text-sm'>
                                    <span>{item.Name} x{item.Qty}</span>
                                    <span>
                                        {(Number(item.Price) * Number(item.Qty)).toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                )}
                </div>

                <button
                    onClick={handleEditOrder}
                    className='text-[#f5f5f5] px-4 py-3 flex items-center justify-center
                               bg-[#2b2b2b] rounded-lg font-semibold cursor-pointer
                               hover:bg-[#3a3a3a]'
                >
                    Chỉnh sửa đơn hàng
                </button>

                <button
                    onClick={() => onProcess?.(detail)}
                    className='text-[#f5f5f5] px-4 py-3 flex items-center justify-center
                               bg-[#d69a03] rounded-lg font-semibold cursor-pointer
                               hover:bg-[#9c7000]'
                >
                    Xử lý đơn
                </button>
            </div>
        </Modal>
    );
};

export default OrderDetailModal;

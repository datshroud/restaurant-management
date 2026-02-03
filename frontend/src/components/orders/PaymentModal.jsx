import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../shared/Modal';
import api from '../../https/api';

const PaymentModal = ({ isOpen, onClose, order, onPaid }) => {
    const [method, setMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);
    const [amount, setAmount] = useState(0);

    const total = useMemo(() => Number(order?.Total ?? 0), [order]);
    const disabled = !order || total <= 0;

    useEffect(() => {
        setAmount(total);
    }, [total]);

    useEffect(() => {
        const loadItems = async () => {
            if (!order?.Id || !isOpen) return;
            try {
                const res = await api.get(`/orders/${order.Id}`);
                setItems(res.data?.items ?? []);
            } catch {
                setItems([]);
            }
        };

        loadItems();
    }, [order, isOpen]);

    const handlePay = async () => {
        if (!order || disabled) return;
        setError('');
        setLoading(true);
        try {
            if (method === 'cash') {
                const payAmount = Number(amount);
                if (!payAmount || payAmount <= 0) {
                    throw new Error('Số tiền thanh toán không hợp lệ');
                }
                await api.post('/payments', {
                    orderId: order.Id,
                    method: 'cash',
                    amount: payAmount,
                });
                onPaid?.({ method: 'cash', orderId: order.Id });
                onClose?.();
                return;
            }

            if (method === 'momo') {
                const res = await api.post('/payments/momo/create', { orderId: order.Id });
                const payUrl = res.data?.payUrl || res.data?.deeplink || res.data?.qrCodeUrl;
                if (payUrl) {
                    window.location.href = payUrl;
                    return;
                }
                throw new Error('Không lấy được link thanh toán MoMo');
            }

            if (method === 'vnpay') {
                const res = await api.post('/payments/vnpay/create', { orderId: order.Id });
                const paymentUrl = res.data?.paymentUrl;
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                    return;
                }
                throw new Error('Không lấy được link thanh toán VNPay');
            }
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Thanh toán thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Thanh toán" isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <div className='flex justify-between text-[#ababab]'>
                    <span>Mã hóa đơn</span>
                    <span className='text-[#f5f5f5] font-semibold'>#{order?.Id ?? 'N/A'}</span>
                </div>
                <div className='flex justify-between text-[#ababab]'>
                    <span>Bàn</span>
                    <span className='text-[#f5f5f5] font-semibold'>
                        {order?.TableName || (order?.TableId ? `T${order.TableId}` : 'N/A')}
                    </span>
                </div>
                <div className='flex justify-between text-[#ababab]'>
                    <span>Tổng tiền</span>
                    <span className='text-[#f5f5f5] font-semibold'>
                        {total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </span>
                </div>

                <div className='border-t border-[#2c2c2c] pt-3'>
                    <p className='text-[#f5f5f5] font-semibold mb-2'>Chi tiết món</p>
                    {items.length === 0 ? (
                        <p className='text-[#ababab] text-sm'>Không có dữ liệu món.</p>
                    ) : (
                        <div className='flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-hide'>
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

                <div className='flex flex-col gap-2'>
                    <label className='text-[#ababab]'>Số tiền thanh toán</label>
                    <input
                        type='number'
                        min={0}
                        value={amount}
                        disabled={method !== 'cash'}
                        onChange={(e) => setAmount(e.target.value)}
                        className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#ababab] focus:outline-none'
                    />
                    {method !== 'cash' && (
                        <p className='text-[#ababab] text-xs'>MoMo/VNPay dùng tổng tiền hóa đơn.</p>
                    )}
                </div>

                <div className='flex flex-col gap-2'>
                    <p className='text-[#f5f5f5] font-semibold'>Hình thức thanh toán</p>
                    <div className='grid grid-cols-3 gap-2'>
                        <button
                            className={`px-3 py-3 rounded-lg border ${method === 'cash' ? 'border-[#f6b100] text-[#f6b100]' : 'border-[#333] text-[#ababab]'}`}
                            onClick={() => setMethod('cash')}
                        >
                            Tiền mặt
                        </button>
                        <button
                            className={`px-3 py-3 rounded-lg border ${method === 'momo' ? 'border-[#f6b100] text-[#f6b100]' : 'border-[#333] text-[#ababab]'}`}
                            onClick={() => {
                                setMethod('momo');
                                setAmount(total);
                            }}
                        >
                            MoMo
                        </button>
                        <button
                            className={`px-3 py-3 rounded-lg border ${method === 'vnpay' ? 'border-[#f6b100] text-[#f6b100]' : 'border-[#333] text-[#ababab]'}`}
                            onClick={() => {
                                setMethod('vnpay');
                                setAmount(total);
                            }}
                        >
                            VNPay
                        </button>
                    </div>
                </div>

                {error && <p className='text-red-400 text-sm'>{error}</p>}

                <button
                    disabled={loading || disabled}
                    onClick={handlePay}
                    className={`text-[#f5f5f5] px-4 py-3 flex items-center justify-center rounded-lg font-semibold ${
                        loading || disabled ? 'bg-[#555]' : 'bg-[#d69a03] hover:bg-[#9c7000]'
                    }`}
                >
                    {loading ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
                {disabled && (
                    <p className='text-[#ababab] text-xs'>Hóa đơn chưa có tổng tiền để thanh toán.</p>
                )}
            </div>
        </Modal>
    );
};

export default PaymentModal;
import React from 'react';
import Modal from '../shared/Modal';

const PaymentSuccessModal = ({ isOpen, onClose, order }) => {
    if (!isOpen) return null;

    return (
        <Modal title="Thanh toán thành công" isOpen={isOpen} onClose={onClose}>
            <div className='flex flex-col gap-4'>
                <p className='text-[#ababab]'>Đơn hàng đã được thanh toán.</p>
                <div className='flex justify-between text-[#ababab]'>
                    <span>Mã hóa đơn</span>
                    <span className='text-[#f5f5f5] font-semibold'>#{order?.Id ?? 'N/A'}</span>
                </div>
                <div className='flex justify-between text-[#ababab]'>
                    <span>Tổng tiền</span>
                    <span className='text-[#f5f5f5] font-semibold'>
                        {Number(order?.Total ?? 0).toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        })}
                    </span>
                </div>
                <div className='flex gap-2'>
                    <button
                        onClick={() => window.print()}
                        className='flex-1 text-[#f5f5f5] px-4 py-3 rounded-lg bg-[#2c4c3f] hover:bg-[#1e342b]'
                    >
                        In hóa đơn
                    </button>
                    <button
                        onClick={onClose}
                        className='flex-1 text-[#f5f5f5] px-4 py-3 rounded-lg bg-[#d69a03] hover:bg-[#9c7000]'
                    >
                        Xong
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentSuccessModal;
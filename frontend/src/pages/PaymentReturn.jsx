import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../https/api';

const PaymentReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Đang xác nhận thanh toán...');

  const provider = useMemo(() => {
    if (location.pathname.includes('momo')) return 'momo';
    if (location.pathname.includes('vnpay')) return 'vnpay';
    return 'unknown';
  }, [location.pathname]);

  useEffect(() => {
    const run = async () => {
      try {
        const params = Object.fromEntries(new URLSearchParams(location.search).entries());
        if (provider === 'momo') {
          const resultCode = params.resultCode;
          if (resultCode && String(resultCode) !== '0') {
            setStatus('failed');
            setMessage('Thanh toán MoMo thất bại.');
            return;
          }
          await api.get('/payments/momo/return', { params });
          setStatus('success');
          setMessage('Thanh toán MoMo thành công.');
          return;
        }

        if (provider === 'vnpay') {
          const responseCode = params.vnp_ResponseCode;
          if (responseCode && String(responseCode) !== '00') {
            setStatus('failed');
            setMessage('Thanh toán VNPay thất bại.');
            return;
          }
          await api.get('/payments/vnpay/return', { params });
          setStatus('success');
          setMessage('Thanh toán VNPay thành công.');
          return;
        }

        setStatus('failed');
        setMessage('Nhà cung cấp thanh toán không hợp lệ.');
      } catch (err) {
        setStatus('failed');
        setMessage(err?.response?.data?.message || 'Xác nhận thanh toán thất bại.');
      }
    };

    run();
  }, [location.search, provider]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-[#1f1f1f] px-4'>
      <div className='bg-[#1a1a1a] rounded-xl shadow-lg px-8 py-10 w-full max-w-xl text-center'>
        <div className={`text-4xl font-bold mb-4 ${status === 'success' ? 'text-[#02ca3a]' : status === 'failed' ? 'text-red-400' : 'text-[#f6b100]'}`}>
          {status === 'success' ? 'Thành công' : status === 'failed' ? 'Thất bại' : 'Đang xử lý'}
        </div>
        <p className='text-[#ababab] mb-8'>{message}</p>
        <button
          onClick={() => navigate('/orders')}
          className='text-[#f5f5f5] px-4 py-3 rounded-lg bg-[#d69a03] hover:bg-[#9c7000]'
        >
          Quay lại đơn hàng
        </button>
      </div>
    </div>
  );
};

export default PaymentReturn;
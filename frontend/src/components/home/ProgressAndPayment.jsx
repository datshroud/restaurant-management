import React, { useMemo, useState } from 'react'
import {FaSearch} from 'react-icons/fa';
import ProgressList from './ProgressList';

const ProgressAndPayment = ({ orders = [] }) => {
  const [tab, setTab] = useState('progress');
  const [keyword, setKeyword] = useState('');

  const filteredOrders = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    const list = orders.filter((o) =>
      tab === 'progress' ? o.Status === 'progress' : o.Status === 'ready',
    );
    if (!normalized) return list;
    return list.filter((o) => {
      const table = (o.TableName || `T${o.TableId || ''}`).toLowerCase();
      return table.includes(normalized) || String(o.Id).includes(normalized);
    });
  }, [orders, tab, keyword]);

  return (
    <div className='flex flex-col bg-[#1a1a1a]
                    gap-6 px-4 py-4 mt-5 rounded-lg flex-1 min-h-0'>
        <div className='flex bg-[#1f1f1f] rounded-lg'>
            <button
                onClick={() => setTab('progress')}
                className={`flex-1 rounded-lg px-4 py-4 flex justify-center cursor-pointer ${
                  tab === 'progress' ? 'bg-[#262626]' : ''
                }`}
            >
                <p className='text-[#f5f5f5] font-semibold'>Đang xử lý</p>
            </button>
            <button
                onClick={() => setTab('ready')}
                className={`flex-1 rounded-lg px-4 py-4 flex justify-center cursor-pointer ${
                  tab === 'ready' ? 'bg-[#262626]' : ''
                }`}
            >
                <p className='text-[#f5f5f5] font-semibold'>Chờ thanh toán</p>
            </button>
        </div>
        <div className='flex items-center gap-4 bg-[#1f1f1f] rounded-[15px]
                        px-5 py-3'>
            <FaSearch className="text-[#f5f5f5]" />
            <input
                type='text'
                placeholder='Tìm kiếm đơn'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className='bg-[#1f1f1f] outline-none text-[#f5f5f5] flex-1'
            />
        </div>
        <ProgressList orders={filteredOrders}/>
    </div>
  )
}

export default ProgressAndPayment
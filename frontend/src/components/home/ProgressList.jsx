import React, {useState} from 'react'
import { FaCheckDouble } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";

const ProgressList = () => {
    const [items] = useState(() =>
        Array.from({length: 10}, (_, i) => ({
        id: i,
        count: 1 + Math.floor(Math.random() * 100),
    })));
    return (
        <div className='flex-1 flex flex-col gap-6 min-h-0 overflow-y-scroll
                        scrollbar-hide'>
            {items.map((item, i) => (
                <div key={i} className='flex justify-between items-center'>
                    <div className='flex gap-3'>
                        <div className='flex h-[50px] w-[50px] items-center 
                                        justify-center bg-[#f6b100] rounded-lg'>
                            <p className='text-lg font-semibold'>A{i + 1}</p>
                        </div>
                        <div>
                            <h1 className='text-[#f5f5f5] text-lg 
                                            font-semibold tracking-wide'>
                                Nhân viên {i}
                            </h1>
                            <p className='text-[#ababab] text-sm'>
                                Mặt hàng: {item.count}
                            </p>
                        </div>
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                        <div className='px-1 py-1 bg-[#2c4c3f] 
                                rounded-lg w-fit'>
                            
                            <p className='text-green-600 text-sm'>
                                <FaCheckDouble className='inline mr-2'/>
                                Sẵn sàng
                            </p>
                        </div>
                        <p className='text-[#f5f5f5] text-xs'>
                            <FaCircle className='text-green-900
                                               text-xs inline mr-2'/>
                            Sẵn sàng phục vụ
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ProgressList
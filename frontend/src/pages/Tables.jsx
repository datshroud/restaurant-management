import React, {useState} from 'react'
import TableCard from '../components/tables/TableCard';
import { tables } from '../constants';
const Tables = () => {
    const [statusType, setStatusType] = useState("all");
    return (
        <div className='flex flex-col px-8 py-4 bg-[#1f1f1f] h-[calc(100vh-5rem)]
                        pb-28'>
            <div className='flex justify-between items-center'>
                <h1 className='text-[#f5f5f5] text-3xl font-semibold'>
                    Bàn
                </h1>
                <div className='flex items-center gap-2'>
                <button onClick={() => setStatusType("all")} className={`
                            ${statusType === "all" ? "bg-[#414040]" : ""} 
                            text-[#ababab] text-lg px-3 py-3 font-semibold 
                            cursor-pointer rounded-lg`}>
                    Tất cả
                </button>
                <button onClick={() => setStatusType("booked")} className={`
                            ${statusType === "booked" ? "bg-[#414040]" : ""} 
                            text-[#ababab] text-lg px-3 py-3 font-semibold 
                            cursor-pointer rounded-lg`}>
                    Đã đặt chỗ
                </button>
                </div>
            </div>
            <div className='grid grid-cols-5 gap-6 py-4 flex-1 min-h-0 
                            h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide'>
                {
                    tables.map((table) => {
                        return <TableCard key={table.id} table={table}/>
                    })
                }
            </div>
        </div>
    )
}

export default Tables
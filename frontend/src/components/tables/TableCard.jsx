import React from 'react'
import { getRandomBG } from '../../utils'

const TableCard = ({table}) => {
  return (
    <div className='flex flex-col px-4 py-4 bg-[#252525] h-fit rounded-lg
                    cursor-pointer shadow-lg hover:bg-[#2c2c2c]'>
        <div className='flex items-center justify-between'>
            <h1 className='text-[#f5f5f5] text-xl font-semibold tracking-wide'>
                Bàn {table.id}
            </h1>
            <div className=
                {`${table.status === "Đã đặt" ? "bg-[#31633f]" : "bg-[#a7780281]"}
                ${table.status === "Đã đặt" ? "text-[#02ca3a]" : "text-[#f6b100]"}
                            px-2 py-2 rounded-lg`}>
                <p>{table.status}</p>
            </div>
        </div>
        <div className='flex justify-center items-center px-4 py-3 mb-4'>
            {/* get div with random color */}

            <div className={`flex justify-center items-center 
                            h-[80px] w-[80px] rounded-full`}
                style={{backgroundColor: getRandomBG()}}>
                <h1 className='text-[#f5f5f5] text-2xl tracking-wide'>
                    {table.initial}
                </h1>
            </div>
        </div>
    </div>
  )
}

export default TableCard
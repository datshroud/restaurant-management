import React from 'react'

const MiniCard = ({title, icon, value, increaseRate, color}) => {
  return (
    <div className='bg-[#1a1a1a] py-5 px-5 rounded-lg flex-1'>
        <div className='flex items-start justify-between'>
            <h1 className='text-2xl text-[#f5f5f5] tracking-wide'>{title}</h1>
            <button className={`${color} p-3 text-[#f5f5f5] font-bold 
                                rounded-sm`}>
                {icon}
            </button>
        </div>
        <div>
            <h1 className='text-[#f5f5f5] text-3xl font-bold mt-2'>
                {
                    title === "Tổng thu nhập" ? 
                        value.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }) : value
                }
            </h1>
            <div className='flex items-end justify-start  mt-2'>
                <h1 className={`${increaseRate > 0 ? "text-[#02ca3a]" : 
                                "text-[#be3e3f]"} text-xl mr-2`}>
                    {Math.abs(increaseRate)}%
                </h1>
                <h1 className=" text-[#f5f5f5] text-xl ">
                    So với hôm qua
                </h1>
            </div>
            
        </div>

    </div>
  )
}

export default MiniCard
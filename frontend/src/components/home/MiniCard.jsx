import React from 'react'

const MiniCard = ({title, icon, value, increaseRate, color}) => {
  return (
    <div className='bg-[#1f1f1f] py-5 px-5 rounded-lg w-[50%]'>
        <div className='flex items-start justify-between'>
            <h1 className='text-2xl text-[#f5f5f5] tracking-wide'>{title}</h1>
            <button className={`${color} p-3 text-[#f5f5f5] font-bold 
                                rounded-sm`}>
                {icon}
            </button>
        </div>
        <div>
            <h1 className='text-[#f5f5f5] text-4xl'>
                {
                    title === "Tổng thu nhập" ? 
                        value.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }) : value
                }
            </h1>
            <div className='flex items-start justify-center mt-2'>
                <h1 className={`${increaseRate > 0 ? "text-[#02ca3a]" : 
                                "text-[#be3e3f]"} text-2xl`}>
                    {Math.abs(increaseRate)}%
                </h1>
                <h1 className=" text-[#f5f5f5] text-2xl ">
                    So với hôm qua
                </h1>
            </div>
            
        </div>

    </div>
  )
}

export default MiniCard
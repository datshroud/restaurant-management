import React from 'react'
import { RiDeleteBin2Fill } from "react-icons/ri";
import { IoDuplicate } from "react-icons/io5";

const ProductCard = ({item}) => {
    const totPrice = item.price * item.quantity;
  return (
    <div className='mt-4 bg-[#1f1f1f] rounded-lg px-4 py-4 flex flex-col gap-4'>
        <div className='flex justify-between items-center'>
            <p className='text-[#ababab] font-semibold text-lg'>
                {item.name}
            </p>
            <p className='text-[#ababab] font-semibold text-lg'>
                x{item.quantity}
            </p>
        </div>
        <div className='flex justify-between items-center'>
            <div className='flex items-center gap-4'>
                <button className='cursor-pointer'>
                    <RiDeleteBin2Fill className='text-[#ababab] text-2xl'/>
                </button> 
                <button className='cursor-pointer'>
                    <IoDuplicate className='text-[#ababab] text-2xl'/>
                </button> 
            </div>
            
            <p className='text-[#f5f5f5] font-bold text-lg'>
                {totPrice.toLocaleString('vi-VN', 
                    { style: 'currency', currency: 'VND' }
                    )
                }
            </p>
        </div>
    </div>
  )
}

export default ProductCard
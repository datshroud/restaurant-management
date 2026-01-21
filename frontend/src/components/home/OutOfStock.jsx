import React from 'react'

const OutOfStock = () => {
  return (
    <div className='flex-1 bg-[#1a1a1a] flex-1 rounded-lg px-6 py-4 gap-4'>
        <div className='flex justify-between items-center'>
            <h1 className='text-[#f5f5f5] text-lg font-semibold'>
                Hết hàng
            </h1>
            <a href="" className='text-[#025cca] text-sm'>Xem thêm</a>
        </div>
    </div>
  )
}

export default OutOfStock
import React from 'react'
import PopularDishesList from './PopularDishesList'

const PopularDishes = () => {
  return (
    <div className='bg-[#1a1a1a] flex-1 min-h-0 rounded-lg px-6 py-4 gap-4
                    flex flex-col'>
        <div className='flex justify-between items-center'>
            <h1 className='text-[#f5f5f5] text-lg font-semibold '>
                Món ăn phổ biến
            </h1>
            <a href="" className='text-[#025cca] text-sm'>Xem thêm</a>
        </div>
        <PopularDishesList/>
    </div>
  )
}

export default PopularDishes
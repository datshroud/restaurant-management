import React from 'react'
import { popularDishes } from '../../constants'

const PopularDishesList = () => {
    let sortedPopularDishes = [...popularDishes].sort(
        (a, b) => b.numberOfOrders - a.numberOfOrders
    );
    return (
        <div className='scrollbar-hide flex-1 min-h-0 overflow-y-auto
                        flex flex-col gap-2'>
            {
                sortedPopularDishes.map((dish, idx) => {
                    return (
                         <div key={dish.id} className='flex items-center 
                                bg-[#1f1f1f] rounded-lg px-4 py-2 gap-4'>
                            <h1 className='text-[#ababab] text-lg'>
                                {String(idx + 1).padStart(2, "0")}
                            </h1>
                            <img src={dish.image} className='h-[50px] w-[50px]
                                    rounded-full' />    
                            <div>
                                <h1 className='text-[#f5f5f5] font-semibold'>
                                    {dish.name}    
                                </h1>
                                <p className='text-[#ababab] text-sm'>
                                    Số lượng: {dish.numberOfOrders}
                                </p>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default PopularDishesList
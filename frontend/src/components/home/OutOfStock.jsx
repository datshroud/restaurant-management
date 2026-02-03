import React from 'react'

const OutOfStock = ({ items = [] }) => {
  return (
  <div className='flex-1 bg-[#1a1a1a] flex-1 rounded-lg px-6 py-4 gap-4
          flex flex-col min-h-0'>
        <div className='flex justify-between items-center'>
            <h1 className='text-[#f5f5f5] text-lg font-semibold'>
                Hết hàng
            </h1>
            <a href="" className='text-[#025cca] text-sm'>Xem thêm</a>
        </div>
    <div className='flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col gap-2'>
      {items.length === 0 ? (
        <p className='text-[#ababab] text-sm'>Không có món hết hàng.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className='flex items-center gap-3 bg-[#1f1f1f] rounded-lg px-4 py-2'>
            {item.image && (
              <img src={item.image} className='h-[40px] w-[40px] rounded-full' />
            )}
            <div>
              <p className='text-[#f5f5f5] font-semibold'>{item.name}</p>
              <p className='text-[#ababab] text-xs'>Đang tạm hết</p>
            </div>
          </div>
        ))
      )}
    </div>
    </div>
  )
}

export default OutOfStock
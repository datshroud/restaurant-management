import React from 'react'

const Modal = ({title, isOpen, onClose, children}) => {
    if (!isOpen) return;
  return (
    <div className='fixed inset-0 bg-black/50 flex
                    items-center justify-center z-50 gap-4'>
        <div className='flex flex-col px-4 py-4 rounded-lg
                         bg-[#1a1a1a] shadow-lg max-w-lg w-full'>
            <div className='flex justify-between items-center border-b
                            px-4 py-4 border-[#333]'>
                <h1 className='text-[#f5f5f5] font-semibold text-2xl'>
                    {title}
                </h1>
                <button className='text-gray-500 text-4xl hover:text-gray-300
                                    cursor-pointer'
                        onClick={onClose}>
                        &times;
                </button>
            </div>
            
            <div className='p-6'>
                {children}
            </div>
        </div>
        
    </div>
  )
}

export default Modal
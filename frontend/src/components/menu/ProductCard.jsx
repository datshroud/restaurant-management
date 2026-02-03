import React from 'react'
import { RiDeleteBin2Fill } from "react-icons/ri";
import { IoDuplicate } from "react-icons/io5";
import { useDispatch } from 'react-redux';
import { removeItemAll, updateQuantity } from '../../redux/slices/cartSlice';

const ProductCard = ({item, readOnly = false}) => {
    const dispatch = useDispatch();
    const totPrice = item.price * item.quantity;
    const stockQty = item?.stockQty;
    const maxQty = typeof stockQty === 'number' ? stockQty : Infinity;
    const canDuplicate = item.quantity < maxQty;

    const handleRemove = () => {
        if (readOnly) return;
        dispatch(removeItemAll({ id: item.id }));
    };

    const handleDuplicate = () => {
        if (readOnly) return;
        if (!canDuplicate) return;
        const nextQty = Math.min(item.quantity * 2, maxQty);
        dispatch(updateQuantity({ id: item.id, quantity: nextQty }));
    };
  return (
    <div className='mt-3 bg-[#1f1f1f] rounded-lg px-4 py-2.5 flex flex-col gap-2 w-full'>
        <div className='flex justify-between items-center'>
            <p className='text-[#ababab] font-semibold text-base'>
                {item.name}
            </p>
            <p className='text-[#ababab] font-semibold text-base'>
                x{item.quantity}
            </p>
        </div>
        <div className='flex justify-between items-center'>
            <div className='flex items-center gap-3'>
                <button onClick={handleRemove} disabled={readOnly} className={`cursor-pointer ${readOnly ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    <RiDeleteBin2Fill className='text-[#ababab] text-xl'/>
                </button> 
                <button
                    onClick={handleDuplicate}
                    disabled={readOnly || !canDuplicate}
                    className={`cursor-pointer ${readOnly || !canDuplicate ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                    <IoDuplicate className='text-[#ababab] text-xl'/>
                </button> 
            </div>
            
            <p className='text-[#f5f5f5] font-bold text-base'>
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
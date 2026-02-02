import React from 'react'
import { getRandomBG } from '../../utils'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateTable } from '../../redux/slices/customerSlice';

const TableCard = ({table}) => {
    const dispatch = useDispatch();
    const bgColor = getRandomBG();
    const navigate = useNavigate();
    const initial = table.initial || table.Name?.split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase() || 'NA';
        const handleClick = (name) => {
        if (table.Status === "Đã đặt") return;
        dispatch(updateTable({tableNo: name}));
        navigate(`/tables/${table.Id}`); 
    }
  return (
        <div onClick={() => handleClick(table.Name)} className='flex flex-col px-4 
                        py-4 bg-[#252525] h-fit rounded-lg
                        cursor-pointer shadow-lg hover:bg-[#2c2c2c]'>
        <div className='flex items-center justify-between'>
            <h1 className='text-[#f5f5f5] text-xl font-semibold tracking-wide'>
                {table.Name}
            </h1>
            <div className=
                {`${table.Status === "Đã đặt" ? "bg-[#31633f]" : "bg-[#a7780281]"}
                ${table.Status === "Đã đặt" ? "text-[#02ca3a]" : "text-[#f6b100]"}
                            px-2 py-2 rounded-lg`}>
                <p>{table.Status}</p>
            </div>
        </div>
        <div className='flex justify-center items-center px-4 py-3 mb-4'>
            {/* get div with random color */}

            <div className={`flex justify-center items-center 
                            h-[80px] w-[80px] bg-[var(--bg)] rounded-full`}
                style={{"--bg": bgColor}}>
                <h1 className='text-[#f5f5f5] text-2xl tracking-wide'>
                    {initial}
                </h1>
            </div>
        </div>
    </div>
  )
}

export default TableCard
import React from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(-1);
    }
  return (
    <button onClick={handleClick}
            className='bg-[#262626] px-4 py-4 rounded-full flex items-center
                    justify-center shadow-lg hover:bg-[#2c2c2c] cursor-pointer'>
        <IoArrowBack className='text-[#f5f5f5] text-2xl'/>
    </button>
  )
}

export default BackButton
import React from 'react'
import logo from "../../assets/images/logo.png"
import {FaSearch, FaBell, FaUserCircle} from 'react-icons/fa';

const Header = () => {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-[#1a1a1a]
                        ">
        {/* logo */}
        <div className="flex items-center gap-2">
            <img src={logo} className="h-8 w-8" alt="restasty logo"/>
            <a href='/' 
                className='text-lg font-semibold text-[#f5f5f5]'>
                Restasty
            </a>
        </div>
        {/* search */}
        <div className='flex items-center gap-4 bg-[#1f1f1f] rounded-[15px]
                        px-5 py-2 w-[500px]'>
            <FaSearch className="text-[#f5f5f5]" />
            <input
                type='text'
                placeholder='Tìm kiếm'
                className='bg-[#1f1f1f] outline-none text-[#f5f5f5] flex-1'
            />
        </div>
        {/* usericon */}
        <div className='flex items-center gap-4'>   
            <div className='bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer'>
                <FaBell className='text-2xl text-[#f5f5f5]'/>
            </div>
            <div className='flex gap-3 item-center cursor-pointer'>
                <FaUserCircle className='text-4xl text-[#f5f5f5]'/>
                <div className='flex flex-col items-start'>
                    <h1 className='text-[#f5f5f5] font-semibold'>Dat Le</h1>
                    <p className='text-[#ababab] text-xs font-medium'>Admin</p>
                </div>
            </div>
        </div>
    </header>
  )
}   

export default Header
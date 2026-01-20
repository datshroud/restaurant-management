import { FaHome } from "react-icons/fa";
import { MdOutlineReorder } from "react-icons/md";
import { MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";

const BottomNav = () => {
  return (
    <div className="fixed flex justify-around bottom-0 left-0 right-0 
                    bg-[#262626] p-2 h-16">
        <div className="flex items-center justify-center text-[#f5f5f5]
                        bg-[#343434] w-[200px] cursor-pointer rounded-[20px]">
            <FaHome className="inline mr-2" size={30}/><p>Home</p>
        </div>
        <div className="flex items-center justify-center text-[#ababab]
                        w-[200px] cursor-pointer rounded-[20px]">
            <MdOutlineReorder className="inline mr-2" size={30}/><p>Orders</p>
        </div>
        <div className="flex items-center justify-center text-[#ababab]
                        w-[200px] cursor-pointer rounded-[20px]">
            <MdTableBar className="inline mr-2" size={30}/><p>Table</p>
        </div>
        <div className="flex items-center justify-center text-[#ababab]
                        w-[200px] cursor-pointer rounded-[20px]">
            <CiCircleMore className="inline mr-2" size={30}/><p>More</p>
        </div>
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#F6B100]
                        text-[#f5f5f5] rounded-full p-4 items-center 
                        justify-center shadow-lg">
            <BiSolidDish size={30}/>
        </div>
    </div>
  )
}

export default BottomNav
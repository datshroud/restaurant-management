import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder } from "react-icons/md";
import { MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

const BottomNav = () => {
  const navigate = useNavigate();
  const [isModalOpen, setOpenModal] = useState(false);
  const [guestCnt, setGuestCnt] = useState(0)
  const openModal = () => setOpenModal(true);
  const closeModal = () => setOpenModal(false);
  const incGuestCnt = () => setGuestCnt(guestCnt + 1)
  const decGuestCnt = () => setGuestCnt(Math.max(guestCnt - 1, 0))

  return (
    <div className="fixed flex justify-around bottom-0 left-0 right-0 
                    bg-[#262626] p-2 h-16">
        <button onClick={() => navigate("/")} className="flex items-center 
                          justify-center text-[#f5f5f5] bg-[#343434] 
                          w-[200px] cursor-pointer rounded-[20px]">
            <FaHome className="inline mr-2" size={30}/><p>Home</p>
        </button>
        <button className="flex items-center justify-center text-[#ababab]
                        w-[200px] cursor-pointer rounded-[20px]"
                onClick={() => navigate("/orders")}>
            <MdOutlineReorder className="inline mr-2" size={30}/><p>Orders</p>
        </button>
        <button className="flex items-center justify-center text-[#ababab]
                        w-[200px] cursor-pointer rounded-[20px]"
                onClick={() => navigate("/tables")}>
            <MdTableBar className="inline mr-2" size={30}/><p>Table</p>
        </button>
        <button className="flex items-center justify-center text-[#ababab]
                        w-[200px] cursor-pointer rounded-[20px]"
                onClick={() => navigate("/")}>
            <CiCircleMore className="inline mr-2" size={30}/><p>More</p>
        </button>
        <button onClick={openModal} className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#F6B100]
                        text-[#f5f5f5] rounded-full p-4 items-center 
                        justify-center shadow-lg cursor-pointer">
            <BiSolidDish size={30}/>
        </button>
        <Modal title={"Tạo hóa đơn"} isOpen={isModalOpen} onClose={closeModal}>
            <div className="flex flex-col gap-4">
                <label className="text-[#ababab]">Tên khách hàng</label>
                <input type="text" name="" id=""
                        placeholder="Nhập tên khách hàng" 
                        className="bg-[#1f1f1f] px-4 py-4 rounded-lg 
                        text-[#ababab] focus:outline-none">
                </input>

                <label className="text-[#ababab]">Số điện thoại</label>
                <input type="number" name="" id=""
                        placeholder="+84-9999999999" 
                        className="bg-[#1f1f1f] px-4 py-4 rounded-lg 
                        text-[#ababab] focus:outline-none">
                </input>
                <label className="block text-[#ababab]">Số khách tham gia</label>
                <div className="flex items-center bg-[#1f1f1f] 
                                justify-between rounded-lg px-4 py-3">
                    <button onClick={decGuestCnt}
                            className="flex items-center justify-center cursor-pointer
                                    text-[#f6b100] text-2xl ">
                        &minus;
                    </button>
                    <span className="text-[#ababab]">{guestCnt} Người</span>
                    <button onClick={incGuestCnt}
                            className="flex items-center justify-center cursor-pointer
                                    text-[#f6b100] text-2xl 
                                    bg-[#1f1f1f]">
                        &#43;
                    </button>
                </div>
                <button className="text-[#f5f5f5] px-4 py-3 flex items-center
                                    justify-center bg-[#d69a03] rounded-lg
                                    font-semibold cursor-pointer 
                                    hover:bg-[#9c7000]"
                        onClick={() => {navigate("/tables"); closeModal()}}>
                    Tạo yêu cầu
                </button>
            </div>
            
        </Modal>
    </div>
  )
}

export default BottomNav
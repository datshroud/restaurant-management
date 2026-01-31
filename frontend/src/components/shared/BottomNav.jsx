import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder } from "react-icons/md";
import { MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isModalOpen, setOpenModal] = useState(false);
  const [guestCnt, setGuestCnt] = useState(0)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const openModal = () => setOpenModal(true);
  const closeModal = () => setOpenModal(false);
  const incGuestCnt = () => setGuestCnt(guestCnt + 1)
  const decGuestCnt = () => setGuestCnt(Math.max(guestCnt - 1, 0))
  const handleCreateOrder = () => {
    // Dispatch action to set customer info
    dispatch(setCustomer({name, phone, guests: guestCnt}));
    navigate("/tables"); closeModal();
  }

  const isActive = (path) => path === location.pathname;

  return (
    <div className="fixed flex justify-around bottom-0 left-0 right-0 
                    bg-[#262626] p-2 h-16">
        <button onClick={() => navigate("/")} className={`flex items-center 
                          justify-center 
                          w-[300px] cursor-pointer rounded-[20px]
                          ${isActive("/") ? "bg-[#343434] text-[#f5f5f5]" 
                            : "text-[#ababab]"}`}>
            <FaHome className="inline mr-2" size={30}/><p>Home</p>
        </button>
        <button className={`flex items-center justify-center 
                        w-[300px] cursor-pointer rounded-[20px]
                        ${isActive("/orders") ? "bg-[#343434] text-[#f5f5f5]" 
                            : "text-[#ababab]"}`}
                onClick={() => navigate("/orders")}>
            <MdOutlineReorder className="inline mr-2" size={30}/><p>Orders</p>
        </button>
        <button className={`flex items-center justify-center 
                        w-[300px] cursor-pointer rounded-[20px]
                        ${isActive("/tables") ? "bg-[#343434] text-[#f5f5f5]" 
                            : "text-[#ababab]"}`}
                onClick={() => navigate("/tables")}>
            <MdTableBar className="inline mr-2" size={30}/><p>Table</p>
        </button>
        <button className={`flex items-center justify-center text-[#ababab]
                        w-[300px] cursor-pointer rounded-[20px]`}
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#1f1f1f] px-4 py-4 rounded-lg 
                        text-[#ababab] focus:outline-none">
                </input>

                <label className="text-[#ababab]">Số điện thoại</label>
                <input type="number" name="" id=""
                        placeholder="+84-9999999999" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                        onClick={() => {handleCreateOrder()}}>
                    Tạo yêu cầu
                </button>
            </div>
            
        </Modal>
    </div>
  )
}

export default BottomNav
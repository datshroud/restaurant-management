import React, {useState} from 'react'
import { menus } from '../../constants'
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch, useSelector } from 'react-redux';
import { addItem, removeItem } from '../../redux/slices/cartSlice';

// const itemCountsRef = {};


const MenuItemCard = ({item, menuId}) => {
    const dispatch = useDispatch();
    const cartItemId = (menuId << 16) + item.id;
    const itemCnt = useSelector((state) => state.cart[cartItemId]?.quantity ?? 0);

    const handleIncItem = (item) => {
        dispatch(addItem({...item, id: cartItemId}));
    }

    const handleDecItem = (item) => {
        dispatch(removeItem({...item, id: cartItemId}));
    }
    return (
        <div className='flex flex-col gap-4 bg-[#1a1a1a] p-6 
                    rounded-xl shadow-lg hover:shadow-xl h-fit'>
            <img className='w-full aspect-[3/2] rounded-lg' 
                    src={item.image}/>
            <h1 className='text-xl text-[#f5f5f5] 
                                tracking-wide font-semibold'>
                {item.name}
            </h1>
            <p className='text-[#ababab] max-h-[20px] overflow-hidden'>
                {item.description}
            </p>
            <div className='flex items-center justify-between'>
                <p className='text-xl text-[#f5f5f5] 
                                tracking-wide font-semibold'>
                    {
                        item.price.toLocaleString(
                            'vi-VN', {
                                style: 'currency', 
                                currency: 'VND'
                            }
                        )
                    }
                </p>
                <div className="flex items-center 
                                justify-between rounded-lg">
                    <button onClick={() => handleDecItem(item)}
                            className="flex items-center 
                                justify-center cursor-pointer
                                    text-[#f5f5f5] text-2xl
                                w-[50px] h-[50px] rounded-full
                                bg-[#363636]">
                        &minus;
                    </button>
                    <span className="text-[#ababab] min-w-[40px]
                                    flex items-center 
                                    justify-center
                                    max-h-[70px]">
                        {itemCnt}
                    </span>
                    <button onClick={() => handleIncItem(item)}
                            className="flex items-center 
                                justify-center cursor-pointer
                                    text-[#f5f5f5] text-2xl 
                                    w-[50px] h-[50px] rounded-full
                                    bg-[#f6b100]">
                        &#43;
                    </button>
                </div>
            </div>
        </div>
    )
}

const MenuContainer = () => {
    const [selectedMenu, setSelectedMenu] = useState(menus[0]);
    
  return (
    <div className='flex-1 flex bg-[#1f1f1f] min-h-0 gap-4'>
        <div className="flex-[1] flex flex-col bg-[#1f1f1f] min-h-0">
            <div className='flex flex-col gap-6 px-4 overflow-y-auto min-h-0
                            scrollbar-hide'>
                {
                    menus.map((items) => {
                        return (
                            <div onClick={() => {setSelectedMenu(items);}}
                                    className={`rounded-2xl px-4 py-4 cursor-pointer shadow-lg
                                            hover:shadow-xl hover:scale-105 
                                            transition-all duration-150
                                            ease-in-out
                                            ${items !== selectedMenu ?
                                                'bg-[#1a1a1a]' : 'bg-[var(--color)]'} `}
                                        style={{"--color": items.bgColor}}
                                key={items.id}>
                                
                                <div className='flex items-center justify-between'>
                                    <h1 className={` text-3xl font-semibold
                                        ${items !== selectedMenu ? 'text-[#f5f5f5]'
                                        : 'text-[#1a1a1a]'}`
                                    }>
                                        {items.icon}    {items.name}
                                    </h1>
                                    {selectedMenu === items && 
                                    <GrRadialSelected className='text-[#1f1f1f] text-2xl'/>}
                                </div>
                                <p className={`mt-10 ${items !== selectedMenu ?
                                    'text-[#ababab]' : 'text-[#1a1a1a]'}
                                    text-lg font-medium  
                                    overflow-hidden`}>

                                    {items.items.length} món
                                </p>
                            </div>
                        )
                    })
                }
            </div>
            
        </div>
        <div className="flex-[3] bg-[#1f1f1f] min-h-0 flex flex-col">
            <div className='flex-1 grid grid-cols-3 gap-6 min-h-0 overflow-y-auto
                            scrollbar-hide '>
                {
                    selectedMenu.items.map((item) => (
                        <MenuItemCard item={item} key={item.id} menuId={selectedMenu.id}/>
                    ))
                }
            </div>
        </div>
    </div>
    
  )
}

export default MenuContainer
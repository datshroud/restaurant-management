import React, {useEffect, useMemo, useState} from 'react'
import { menus as menuMeta } from '../../constants'
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch, useSelector } from 'react-redux';
import { addItem, removeItem } from '../../redux/slices/cartSlice';
import api from '../../https/api';

// const itemCountsRef = {};


const MenuItemCard = ({item, menuId, readOnly = false}) => {
    const dispatch = useDispatch();
    const cartItemId = (menuId << 16) + item.id;
    const itemCnt = useSelector((state) => state.cart[cartItemId]?.quantity ?? 0);
    const stockQty = item?.stockQty ?? null;
    const stockUnit = item?.stockUnit ?? '';
    const isOutOfStock = typeof stockQty === 'number' && stockQty <= 0;
    const canIncrease = typeof stockQty !== 'number' || itemCnt < stockQty;

    const handleIncItem = (item) => {
        if (readOnly) return;
        if (!canIncrease) return;
        dispatch(addItem({ ...item, id: cartItemId, menuItemId: item.id }));
    }

    const handleDecItem = (item) => {
        if (readOnly) return;
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
            <p className='text-[#ababab] text-sm'>
                Tồn kho: {typeof stockQty === 'number' ? `${stockQty} ${stockUnit || ''}` : 'Không theo dõi'}
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
                    <button
                            onClick={() => handleDecItem(item)}
                            disabled={readOnly}
                            className={`flex items-center 
                                justify-center cursor-pointer
                                    text-[#f5f5f5] text-2xl
                                w-[50px] h-[50px] rounded-full
                                ${readOnly ? 'bg-[#555] cursor-not-allowed text-[#ababab]' : 'bg-[#363636]'}`}>
                        &minus;
                    </button>
                    <span className="text-[#ababab] min-w-[40px]
                                    flex items-center 
                                    justify-center
                                    max-h-[70px]">
                        {itemCnt}
                    </span>
                    <button onClick={() => handleIncItem(item)}
                            disabled={readOnly || !canIncrease || isOutOfStock}
                            className={`flex items-center 
                                justify-center text-2xl 
                                w-[50px] h-[50px] rounded-full
                                ${readOnly || !canIncrease || isOutOfStock ? 'bg-[#555] cursor-not-allowed text-[#ababab]' : 'bg-[#f6b100] cursor-pointer text-[#f5f5f5]'}`}
                            >
                        &#43;
                    </button>
                </div>
            </div>
        </div>
    )
}

const MenuContainer = ({ searchTerm = '', sortOrder = 'asc', readOnly = false }) => {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);

    useEffect(() => {
        const load = async () => {
            const [catRes, itemRes] = await Promise.all([
                api.get('/menu/categories'),
                api.get('/menu/items'),
            ]);
            setCategories(catRes.data ?? []);
            setItems(itemRes.data ?? []);
        };

        load();
    }, []);

    const menuList = useMemo(() => {
        return categories.map((cat) => {
            const meta = menuMeta.find((m) => m.name === cat.Name);
            return {
                id: cat.Id,
                name: cat.Name,
                icon: meta?.icon ?? '🍽️',
                bgColor: meta?.bgColor ?? '#2a2a2a',
                items: items
                    .filter((i) => i.CategoryId === cat.Id)
                    .map((i) => ({
                        id: i.Id,
                        name: i.Name,
                        description: i.Description,
                        price: i.Price,
                        image: i.ImageUrl,
                        stockQty: i.StockQty,
                        stockUnit: i.StockUnit,
                    })),
            };
        });
    }, [categories, items]);

    useEffect(() => {
        if (selectedMenu && !menuList.find((m) => m.id === selectedMenu.id)) {
            setSelectedMenu(null);
        }
    }, [menuList, selectedMenu]);

    const filteredItems = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        const sourceItems = selectedMenu
            ? selectedMenu.items.map((item) => ({ ...item, menuId: selectedMenu.id }))
            : menuList.flatMap((menu) =>
                menu.items.map((item) => ({ ...item, menuId: menu.id }))
            );

        const searched = normalized
            ? sourceItems.filter((item) =>
                item.name.toLowerCase().includes(normalized) ||
                (item.description ?? '').toLowerCase().includes(normalized)
            )
            : sourceItems;

        const sorted = [...searched].sort((a, b) => {
            if (sortOrder === 'desc') return b.price - a.price;
            return a.price - b.price;
        });

        return sorted;
    }, [menuList, selectedMenu, searchTerm, sortOrder]);
    
  return (
    <div className='flex-1 flex bg-[#1f1f1f] min-h-0 gap-4'>
        <div className="flex-[1] flex flex-col bg-[#1f1f1f] min-h-0">
            <div className='flex flex-col gap-6 px-4 overflow-y-auto min-h-0
                            scrollbar-hide'>
                {
                    menuList.map((items) => {
                        return (
                            <div onClick={() => {
                                    if (selectedMenu?.id === items.id) {
                                        setSelectedMenu(null);
                                    } else {
                                        setSelectedMenu(items);
                                    }
                                }}
                                    className={`rounded-2xl px-4 py-4 cursor-pointer shadow-lg
                                            hover:shadow-xl hover:scale-105 
                                            transition-all duration-150
                                            ease-in-out
                                            ${items.id !== selectedMenu?.id ?
                                                'bg-[#1a1a1a]' : 'bg-[var(--color)]'} `}
                                        style={{"--color": items.bgColor}}
                                key={items.id}>
                                
                                <div className='flex items-center justify-between'>
                                    <h1 className={` text-3xl font-semibold
                                        ${items.id !== selectedMenu?.id ? 'text-[#f5f5f5]'
                                        : 'text-[#1a1a1a]'}`
                                    }>
                                        {items.icon}    {items.name}
                                    </h1>
                                    {selectedMenu?.id === items.id && 
                                    <GrRadialSelected className='text-[#1f1f1f] text-2xl'/>}
                                </div>
                                <p className={`mt-10 ${items.id !== selectedMenu?.id ?
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
                    filteredItems.map((item) => (
                        <MenuItemCard item={item} key={`${item.menuId}-${item.id}`} menuId={item.menuId} readOnly={readOnly}/>
                    ))
                }
            </div>
        </div>
    </div>
    
  )
}

export default MenuContainer

import React from 'react'
import ProductCard from './ProductCard'
import { useDispatch, useSelector } from 'react-redux'
import { formatDate, formatTime, getAvatarName } from '../../utils';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../https/api';
import { setEditMode, setOrderId, updateGuests, updateTable } from '../../redux/slices/customerSlice';
import { clearCart, setCart } from '../../redux/slices/cartSlice';
import { MdEdit } from 'react-icons/md';

const OrderDetailContainer = ({ readOnly = false }) => {
    const customerData = useSelector((state) => state.customer);
    const cartData = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    // eslint-disable-next-line no-unused-vars
    const [dateTime, setDateTime] = useState(new Date());
    const location = useLocation();
    const navigate = useNavigate();
    const { id: tableIdParam } = useParams();
    const tableId = Number(tableIdParam);
    const stateTableIds = Array.isArray(location.state?.selectedTableIds)
        ? location.state.selectedTableIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
        : [];
    const [existingItems, setExistingItems] = useState([]);
    const [orderMeta, setOrderMeta] = useState(null);
    const [existingLoading, setExistingLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [orderMethod, setOrderMethod] = useState(location.state?.orderMethod || 'dine_in');
    const isEditMode = Boolean(customerData?.editMode);
    const isReadOnly = Boolean(readOnly || location.state?.readOnly);
    const readOnlyOrderId = location.state?.orderId ? String(location.state.orderId) : '';
    const items = Object.values(cartData);
    const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const existingTotal = existingItems.reduce(
        (sum, item) => sum + Number(item.Price ?? 0) * Number(item.Qty ?? 0),
        0,
    );
    const total = isEditMode ? newTotal : existingTotal + newTotal;

    const getSelectedTableIds = () => {
        if (stateTableIds.length) return stateTableIds;
        if (Array.isArray(customerData?.tableIds) && customerData.tableIds.length) {
            return customerData.tableIds;
        }
        if (Number.isFinite(tableId) && tableId > 0) return [tableId];
        return [];
    };

    useEffect(() => {
        const loadExistingItems = async () => {
            if (isReadOnly && readOnlyOrderId) {
                setExistingLoading(true);
                try {
                    const orderRes = await api.get(`/orders/${readOnlyOrderId}`);
                    setExistingItems(orderRes.data?.items ?? []);
                    setOrderMeta(orderRes.data ?? null);
                    dispatch(setOrderId({ orderId: String(orderRes.data?.Id ?? readOnlyOrderId) }));
                } catch {
                    setExistingItems([]);
                    setOrderMeta(null);
                } finally {
                    setExistingLoading(false);
                }
                return;
            }
            if (isEditMode) {
                setExistingItems([]);
                setExistingLoading(false);
                setOrderMeta(null);
                return;
            }
            const selectedTableIds = getSelectedTableIds();

            if (!selectedTableIds.length) {
                setExistingItems([]);
                dispatch(setOrderId({ orderId: "" }));
                return;
            }
            setExistingLoading(true);
            try {
                const ordersRes = await api.get('/orders');
                const orders = (ordersRes.data ?? []).map((order) => {
                    let tableIds = [];
                    if (Array.isArray(order?.tableIds) && order.tableIds.length) {
                        tableIds = order.tableIds;
                    } else if (typeof order?.TableIds === 'string' && order.TableIds.trim()) {
                        tableIds = order.TableIds.split(',')
                            .map((part) => Number(part.trim()))
                            .filter((id) => Number.isFinite(id) && id > 0);
                    } else if (order?.TableId) {
                        tableIds = [Number(order.TableId)];
                    }
                    return { ...order, tableIds };
                });
                const tableIdSet = new Set(selectedTableIds.map((id) => Number(id)));
                const activeOrders = orders
                    .filter((o) => (Array.isArray(o?.tableIds) && o.tableIds.some((id) => tableIdSet.has(Number(id))))
                        || tableIdSet.has(Number(o?.TableId)))
                    .filter((o) => String(o?.Status ?? '').toLowerCase() !== 'completed');
                const latest = activeOrders
                    .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))[0];

                if (!latest?.Id) {
                    setExistingItems([]);
                    setOrderMeta(null);
                    dispatch(setOrderId({ orderId: "" }));
                    return;
                }

                dispatch(setOrderId({ orderId: String(latest.Id) }));
                setOrderMeta(latest);
                const itemsRes = await api.get(`/orders/${latest.Id}`);
                setExistingItems(itemsRes.data?.items ?? []);
            } catch {
                setExistingItems([]);
                setOrderMeta(null);
                dispatch(setOrderId({ orderId: "" }));
            } finally {
                setExistingLoading(false);
            }
        };

        loadExistingItems();
    }, [tableId, customerData?.tableIds, stateTableIds.length, isEditMode, isReadOnly, readOnlyOrderId, dispatch]);

    useEffect(() => {
        if (!isReadOnly) return;
        dispatch(setEditMode({ editMode: false }));
        dispatch(clearCart());
    }, [isReadOnly, dispatch]);

    useEffect(() => {
        const loadOrderMethod = async () => {
            if (location.state?.orderMethod) {
                setOrderMethod(location.state.orderMethod);
                return;
            }
            const selectedTableIds = getSelectedTableIds();

            if (!selectedTableIds.length) {
                setOrderMethod('dine_in');
                return;
            }

            try {
                const res = await api.get('/tables');
                const tables = res.data ?? [];
                const idSet = new Set(selectedTableIds.map((id) => Number(id)));
                const reserved = tables.some((t) => idSet.has(Number(t.Id)) &&
                    ['reserved', 'booked', 'đã đặt', 'đã đặt trước', '2'].includes(String(t.Status ?? '').toLowerCase()));
                setOrderMethod(reserved ? 'reserved' : 'dine_in');
            } catch {
                setOrderMethod('dine_in');
            }
        };

        loadOrderMethod();
    }, [customerData?.tableIds, tableId, stateTableIds.length, location.state?.orderMethod]);

    useEffect(() => {
        const loadOrderForEdit = async () => {
            if (!isEditMode) {
                setEditLoading(false);
                return;
            }
            const orderId = String(customerData?.orderId ?? '').trim();
            if (!orderId) {
                dispatch(setEditMode({ editMode: false }));
                return;
            }

            setEditLoading(true);
            try {
                const orderRes = await api.get(`/orders/${orderId}`);
                setOrderMeta(orderRes.data ?? null);
                const orderItems = orderRes.data?.items ?? [];
                const orderTables = orderRes.data?.tables ?? [];
                const fetchedTableIds = Array.isArray(orderRes.data?.tableIds) ? orderRes.data.tableIds : [];
                const selectedIds = stateTableIds.length ? stateTableIds : fetchedTableIds;

                if (Array.isArray(selectedIds) && selectedIds.length) {
                    const names = orderTables.length && !stateTableIds.length
                        ? orderTables.map((t) => t.Name || (t.TableNo ? `T${t.TableNo}` : `Bàn ${t.Id}`)).join(', ')
                        : selectedIds.map((id) => `Bàn ${id}`).join(', ');
                    dispatch(updateTable({ tableNo: names, tableIds: selectedIds }));
                }

                const menuRes = await api.get('/menu/items');
                const menuItems = menuRes.data ?? [];
                const metaById = new Map(menuItems.map((m) => [Number(m.Id), m]));

                const nextCart = {};
                orderItems.forEach((it) => {
                    const menuItemId = Number(it.MenuItemId);
                    const qty = Number(it.Qty);
                    if (!Number.isFinite(menuItemId) || menuItemId <= 0 || !Number.isFinite(qty) || qty <= 0) return;
                    const meta = metaById.get(menuItemId);
                    const categoryId = Number(meta?.CategoryId ?? 0);
                    const cartId = Number.isFinite(categoryId) && categoryId > 0
                        ? (categoryId << 16) + menuItemId
                        : menuItemId;

                    nextCart[cartId] = {
                        id: cartId,
                        menuItemId,
                        name: meta?.Name ?? it.Name,
                        description: meta?.Description ?? null,
                        price: meta?.Price ?? it.Price,
                        image: meta?.ImageUrl ?? null,
                        stockQty: meta?.StockQty ?? null,
                        stockUnit: meta?.StockUnit ?? '',
                        quantity: qty,
                    };
                });

                dispatch(setCart(nextCart));
                setExistingItems([]);
            } catch (err) {
                window.alert(err?.response?.data?.message || 'Không tải được đơn để chỉnh sửa.');
                dispatch(setEditMode({ editMode: false }));
            } finally {
                setEditLoading(false);
            }
        };

        loadOrderForEdit();
    }, [isEditMode, customerData?.orderId, dispatch, stateTableIds.length]);

    const getMenuItemId = (item) => {
        const raw = Number(item?.menuItemId ?? item?.id);
        if (!Number.isFinite(raw) || raw <= 0) return null;
        if (item?.menuItemId) return raw;
        return raw > 65535 ? raw & 0xffff : raw;
    };

    const handleUpsertOrder = async () => {
        if (processing) return;
        if (isReadOnly) return;
        if (!Number.isFinite(tableId) || tableId <= 0) {
            window.alert('Không xác định được bàn để tạo/cập nhật yêu cầu.');
            return;
        }

        const selectedTableIds = getSelectedTableIds().length
            ? getSelectedTableIds()
            : [tableId];

        const payloadItems = items
            .map((item) => ({
                menuItemId: getMenuItemId(item),
                qty: Number(item.quantity ?? 0),
            }))
            .filter((item) => Number.isFinite(item.menuItemId) && item.menuItemId > 0 && item.qty > 0);

        if (!payloadItems.length) {
            window.alert('Chưa có món hợp lệ để tạo/cập nhật yêu cầu.');
            return;
        }

        const rawUserId = Number(localStorage.getItem('userId'));
        const createdByUserId =
            Number.isFinite(rawUserId) && rawUserId > 0 ? rawUserId : undefined;

        setProcessing(true);
        try {
            const res = isEditMode
                ? await api.put(`/orders/${customerData.orderId}`, {
                    tableId,
                    createdByUserId,
                    tableIds: selectedTableIds,
                    items: payloadItems,
                })
                : await api.post('/orders/upsert', {
                    tableId,
                    createdByUserId,
                    tableIds: selectedTableIds,
                    items: payloadItems,
                });
            const nextOrderId = res.data?.id;
            if (nextOrderId) {
                dispatch(setOrderId({ orderId: String(nextOrderId) }));
            }
            dispatch(clearCart());
            if (isEditMode) {
                dispatch(setEditMode({ editMode: false }));
            }
            navigate('/orders');
        } catch (err) {
            window.alert(err?.response?.data?.message || 'Xử lý thất bại.');
        } finally {
            setProcessing(false);
        }
    };

    const resolveSelectedTables = () => {
    const ids = getSelectedTableIds()
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0);

        if (ids.length) {
            return ids.map((id) => String(id));
        }

        const raw = String(customerData?.tableNo ?? '').trim();
        if (!raw) return [];
        const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
        return parts
            .map((part) => part.match(/\d+/g)?.join(''))
            .filter(Boolean);
    };

    const selectedTableNumbers = resolveSelectedTables();
    const selectedTablesFullLabel = selectedTableNumbers.length
        ? selectedTableNumbers.join(', ')
        : 'Chưa chọn';
    const selectedTablesLabel = selectedTableNumbers.length > 3
        ? `${selectedTableNumbers.slice(0, 3).join(', ')}...`
        : selectedTablesFullLabel;

    const handleEditTables = () => {
        if (isReadOnly) return;
        const selectedIds = getSelectedTableIds();
        navigate('/tables', { state: { selectMode: true, returnTo: location.pathname, selectedTableIds: selectedIds } });
    };

    const isGuestKnown = customerData?.guestMode === 'known';
    const guestsValue = Math.max(Number(customerData?.guests ?? 0) || 0, 1);
    const orderMethodLabel = orderMethod === 'reserved' ? 'Đặt từ trước' : 'Ăn tại bàn';
    const isPaid = String(orderMeta?.Status ?? '').toLowerCase() === 'completed';
    const staffName = orderMeta?.CreatedByName || customerData.customerName || '';
    const staffInitials = getAvatarName(staffName) || 'NV';
    return (
        <div className='flex-1 min-h-0 rounded-xl bg-[#1a1a1a] flex flex-col shadow-lg overflow-hidden'>
        {/* Customer Info */}
        <div className='flex flex-col gap-2 px-6 py-6'>
            <h1 className='text-2xl text-[#f5f5f5] font-semibold'> 
                Thông tin khách hàng 
            </h1>
            <div className='flex gap-3 items-center justify-between'>
                <div>
                    <h1 className='text-[#f5f5f5] text-lg 
                                    font-semibold tracking-wide'>
                        {customerData.customerName || "Không xác định"} 
                    </h1>
                    <p className='text-[#ababab] text-sm'>
                        #{customerData.orderId || "Không xác định"} / {orderMethodLabel}
                    </p>
                </div>
                <div className={`flex h-[50px] w-[50px] items-center 
                                justify-center rounded-lg ${isPaid ? 'bg-[#22c55e]' : 'bg-[#f6b100]'}`}>
                    <p className='text-lg font-semibold'>
                        {staffInitials}
                    </p>
                </div>
            </div>
            <p className='text-[#ababab]'>{formatDate(dateTime)} | {formatTime(dateTime)}</p>
            
        </div>
        <hr className='border-t-3 border-[#1f1f1f]' />
        <div className='flex-1 min-h-0 overflow-y-auto scrollbar-hide'>
            <div className='px-6 py-4'>
                <div className='bg-[#1f1f1f] rounded-xl px-4 py-4 border border-[#2c2c2c]'>
                    <div className='flex items-center justify-between text-[#ababab] text-sm'>
                        <span>Hình thức</span>
                        <select
                            value={orderMethod}
                            onChange={(e) => setOrderMethod(e.target.value)}
                            disabled={isReadOnly}
                            className={`bg-[#1a1a1a] text-[#f5f5f5] text-sm rounded-lg px-3 py-2 border border-[#333] outline-none ${isReadOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                        >
                            <option value="dine_in">Ăn tại bàn</option>
                            <option value="reserved">Đặt từ trước</option>
                        </select>
                    </div>

                    <div className='flex items-center justify-between mt-3 text-[#ababab] text-sm'>
                        <span>Bàn đã chọn:</span>
                        <div className='flex items-center gap-2 text-[#f5f5f5]'>
                            <span className='text-sm' title={selectedTablesFullLabel}>{selectedTablesLabel}</span>
                            <button
                                onClick={handleEditTables}
                                disabled={isReadOnly}
                                className={`p-2 rounded-md ${isReadOnly ? 'bg-[#3a3a3a] text-[#8a8a8a] cursor-not-allowed' : 'bg-[#2b2b2b] hover:bg-[#3a3a3a] text-[#f5f5f5]'}`}
                                title="Xem bàn đã chọn"
                            >
                                <MdEdit size={16} />
                            </button>
                        </div>
                    </div>

                    <div className='flex items-center justify-between mt-3 text-[#ababab] text-sm'>
                        <span>Số khách:</span>
                        {isGuestKnown ? (
                            <input
                                type="number"
                                min={1}
                                value={guestsValue}
                                onChange={(e) => dispatch(updateGuests({ guests: Number(e.target.value || 1) }))}
                                disabled={isReadOnly}
                                className={`bg-[#1a1a1a] text-[#f5f5f5] text-sm rounded-lg px-3 py-2 border border-[#333] outline-none w-28 text-right ${isReadOnly ? 'cursor-not-allowed opacity-70' : ''}`}
                            />
                        ) : (
                            <span className='text-[#f5f5f5]'>Không xác định</span>
                        )}
                    </div>
                </div>
            </div>
            {/* Order detail */}
            <div className='flex flex-col px-6 py-6'>
                <h1 className='text-2xl text-[#f5f5f5] font-semibold'> 
                    Chi tiết yêu cầu
                </h1>
                {isEditMode ? (
                    <div className='mt-4'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-lg text-[#f5f5f5] font-semibold'>Món trong đơn</h2>
                        </div>
                        {editLoading ? (
                            <p className='text-[#ababab] mt-3 text-sm'>Đang tải...</p>
                        ) : items.length === 0 ? (
                            <p className='text-[#ababab] mt-3 text-sm'>Không có món trong đơn.</p>
                        ) : (
                            <div className='mt-2 max-h-[420px] overflow-y-auto scrollbar-hide pr-1'>
                                {items.map((item) => (
                                    <ProductCard key={item.id} item={item} readOnly={isReadOnly} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className='mt-4'>
                            <div className='flex items-center justify-between'>
                                <h2 className='text-lg text-[#f5f5f5] font-semibold'>Món đã có</h2>
                            </div>
                            <p className='text-xs text-[#7a7a7a] mt-1'>Món đã có không thể chỉnh sửa.</p>
                            {existingLoading ? (
                                <p className='text-[#ababab] mt-3 text-sm'>Đang tải...</p>
                            ) : existingItems.length === 0 ? (
                                <p className='text-[#ababab] mt-3 text-sm'>Chưa có món đã gọi.</p>
                            ) : (
                                <div className='mt-3 flex flex-col gap-2'>
                                    {existingItems.map((item) => (
                                        <div key={item.Id} className='flex justify-between text-[#ababab] text-sm'>
                                            <span>{item.Name} x{item.Qty}</span>
                                            <span>
                                                {(Number(item.Price) * Number(item.Qty)).toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className='mt-6'>
                            <div className='flex items-center justify-between'>
                                <h2 className='text-lg text-[#f5f5f5] font-semibold'>Món mới thêm</h2>
                            </div>
                            {items.length === 0 ? (
                                <p className='text-[#ababab] mt-3 text-sm'>Chưa có món mới được thêm vào.</p>
                            ) : (
                                <div className='mt-2 max-h-[320px] overflow-y-auto scrollbar-hide pr-1'>
                                    {items.map((item) => (
                                        <ProductCard key={item.id} item={item} readOnly={isReadOnly} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
        <div className='mt-auto px-6 pb-6'>
            <div className='flex items-center justify-between text-[#ababab] mb-4'>
                <span>Tổng cộng</span>
                <span className='text-[#f5f5f5] font-semibold'>
                    {total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
            </div>
            <button
                disabled={processing || items.length === 0 || isReadOnly}
                onClick={handleUpsertOrder}
                className={`w-full text-[#f5f5f5] px-4 py-3 flex items-center
                            justify-center rounded-lg font-semibold
                            ${processing || items.length === 0 || isReadOnly ? 'bg-[#444]' : 'bg-[#d69a03] hover:bg-[#9c7000]'}`}
            >
                {processing
                    ? 'Đang xử lý...'
                    : isReadOnly
                        ? 'Đã thanh toán'
                        : isEditMode
                            ? 'Lưu chỉnh sửa'
                            : customerData.orderId
                                ? 'Cập nhật yêu cầu'
                                : 'Tạo yêu cầu'}
            </button>
        </div>
    </div>
  )
}

export default OrderDetailContainer

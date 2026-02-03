import React, {useEffect, useMemo, useRef, useState} from 'react'
import TableCard from '../components/tables/TableCard';
import TableDetailModal from '../components/tables/TableDetailModal';
import api from '../https/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeCustomer, setEditMode, setOrderId, updateGuests, updateTable } from '../redux/slices/customerSlice';
import { clearCart } from '../redux/slices/cartSlice';
const Tables = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const customer = useSelector((state) => state.customer);
    const [statusType, setStatusType] = useState("all");
    const [tables, setTables] = useState([]);
    const [selectedTables, setSelectedTables] = useState([]);
    const [sortKey, setSortKey] = useState('tableNo');
    const [sortDir, setSortDir] = useState('asc');
    const [isDetailOpen, setDetailOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const isSelectMode = Boolean(location.state?.selectMode);
    const returnTo = location.state?.returnTo;
    const stateSelectedTableIds = Array.isArray(location.state?.selectedTableIds)
        ? location.state.selectedTableIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
        : [];
    const initialTableIdsRef = useRef(customer?.tableIds ?? []);
    const initialTableNoRef = useRef(customer?.tableNo ?? '');
    const initializedSelectionRef = useRef(false);
    const originalSelectedIds = useMemo(() => {
        if (!isSelectMode || !returnTo) return [];
        if (stateSelectedTableIds.length) return stateSelectedTableIds;
        const fromStore = Array.isArray(initialTableIdsRef.current) ? initialTableIdsRef.current : [];
        return fromStore.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0);
    }, [isSelectMode, returnTo, stateSelectedTableIds]);

    useEffect(() => {
        const load = async () => {
            const res = await api.get('/tables');
            setTables(res.data ?? []);
        };

        load();
    }, []);

    useEffect(() => {
        if (isSelectMode) {
            initializedSelectionRef.current = false;
            return;
        }
        setSelectedTables([]);
    }, [isSelectMode]);

    useEffect(() => {
        if (!isSelectMode) return;
        if (initializedSelectionRef.current) return;
        if (!tables.length) return;

        initializedSelectionRef.current = true;

        const tableIds = stateSelectedTableIds.length
            ? stateSelectedTableIds
            : Array.isArray(customer?.tableIds)
                ? customer.tableIds
                : [];
        if (!tableIds.length) return;

        const idSet = new Set(tableIds.map((id) => Number(id)));
        const preselected = tables.filter((t) => idSet.has(Number(t.Id)));
        if (preselected.length) {
            setSelectedTables(preselected);
        }
    }, [isSelectMode, tables, customer?.tableIds, stateSelectedTableIds.length]);

    const normalizeOrder = (order) => {
        if (!order) return order;
        let tableIds = [];
        if (Array.isArray(order.tableIds) && order.tableIds.length) {
            tableIds = order.tableIds;
        } else if (Array.isArray(order.tables) && order.tables.length) {
            tableIds = order.tables.map((t) => Number(t.Id)).filter((id) => Number.isFinite(id) && id > 0);
        } else if (typeof order.TableIds === 'string' && order.TableIds.trim()) {
            tableIds = order.TableIds.split(',')
                .map((part) => Number(part.trim()))
                .filter((id) => Number.isFinite(id) && id > 0);
        } else if (order.TableId) {
            tableIds = [Number(order.TableId)];
        }

        let tableNames = [];
        if (Array.isArray(order.tableNames) && order.tableNames.length) {
            tableNames = order.tableNames;
        } else if (Array.isArray(order.tables) && order.tables.length) {
            tableNames = order.tables.map((t) => t.Name || (t.TableNo ? `Bàn ${t.TableNo}` : `Bàn ${t.Id}`));
        } else if (typeof order.TableNames === 'string' && order.TableNames.trim()) {
            tableNames = order.TableNames.split(',').map((name) => name.trim()).filter(Boolean);
        } else if (order.TableName) {
            tableNames = [order.TableName];
        } else if (tableIds.length) {
            tableNames = tableIds.map((id) => `Bàn ${id}`);
        }

        return { ...order, tableIds, tableNames };
    };

    const loadOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await api.get('/orders');
            const data = (res.data ?? []).map(normalizeOrder);
            setOrders(data);
        } finally {
            setOrdersLoading(false);
        }
    };

    const getTableNoValue = (table) => {
        const raw = table.TableNo ?? table.tableNo ?? table.Id ?? '';
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) return parsed;
        const name = String(table.Name ?? '');
        const digits = name.match(/\d+/g)?.join('');
        return digits ? Number(digits) : Number.MAX_SAFE_INTEGER;
    };

    const getSeatsValue = (table) => {
        const seats = Number(table.Seats ?? table.seats ?? table.Capacity ?? table.capacity ?? 0);
        return Number.isFinite(seats) ? seats : 0;
    };

    const filteredTables = useMemo(() => {
        const filtered = (() => {
            if (statusType === 'all') return tables;
            if (statusType === 'booked') {
                return tables.filter((t) => {
                    const normalized = String(t.Status ?? '').toLowerCase();
                    return ['booked', 'đã đặt', 'đã đặt trước', 'reserved', '2'].includes(normalized);
                });
            }
            if (statusType === 'occupied') {
                return tables.filter((t) => {
                    const normalized = String(t.Status ?? '').toLowerCase();
                    return ['occupied', 'dine in', 'dinein', 'đang dùng', 'đang phục vụ', 'đang sử dụng', '3', 'in use', 'ăn tại chỗ'].includes(normalized);
                });
            }
            if (statusType === 'available') {
                return tables.filter((t) => {
                    const normalized = String(t.Status ?? '').toLowerCase();
                    return ['available', 'trống', '1', 'có sẵn', 'empty'].includes(normalized);
                });
            }
            return tables;
        })();

        const sorted = [...filtered].sort((a, b) => {
            let left = 0;
            let right = 0;
            if (sortKey === 'seats') {
                left = getSeatsValue(a);
                right = getSeatsValue(b);
            } else if (sortKey === 'name') {
                return sortDir === 'asc'
                    ? String(a.Name ?? '').localeCompare(String(b.Name ?? ''), 'vi')
                    : String(b.Name ?? '').localeCompare(String(a.Name ?? ''), 'vi');
            } else {
                left = getTableNoValue(a);
                right = getTableNoValue(b);
            }
            return sortDir === 'asc' ? left - right : right - left;
        });

        return sorted;
    }, [tables, statusType, sortKey, sortDir]);

    const totalSeats = selectedTables.reduce((sum, t) => {
        const seats = Number(t.Seats ?? t.seats ?? t.Capacity ?? t.capacity ?? 0);
        return sum + (Number.isFinite(seats) ? seats : 0);
    }, 0);

    const isGuestKnown = customer?.guestMode === 'known' && (customer?.guests ?? 0) > 0;

    const handleSelectTable = (table) => {
        if (!table) return;
        const isSelected = selectedTables.some((t) => t.Id === table.Id);
        if (isSelected) {
            const next = selectedTables.filter((t) => t.Id !== table.Id);
            setSelectedTables(next);
            dispatch(updateTable({ tableNo: next.map((t) => t.Name).join(', '), tableIds: next.map((t) => t.Id) }));
            return;
        }
        if (isGuestKnown && totalSeats >= (customer?.guests ?? 0)) {
            window.alert('Đã đủ chỗ, chọn thêm sẽ dư.');
            return;
        }
        const next = [...selectedTables, table];
        setSelectedTables(next);
        dispatch(updateTable({ tableNo: next.map((t) => t.Name).join(', '), tableIds: next.map((t) => t.Id) }));
    };

    const handleConfirmSelect = () => {
        if (!selectedTables.length) {
            window.alert('Bạn chưa chọn bàn.');
            return;
        }
        if (isGuestKnown && totalSeats < (customer?.guests ?? 0)) {
            window.alert('Chưa đủ chỗ, vui lòng chọn thêm bàn.');
            return;
        }
        if (!isGuestKnown) {
            dispatch(updateGuests({ guests: totalSeats }));
        }
        dispatch(updateTable({
            tableNo: selectedTables.map((t) => t.Name).join(', '),
            tableIds: selectedTables.map((t) => t.Id),
        }));
        const target = selectedTables[selectedTables.length - 1];
        navigate(`/tables/${target.Id}`, {
            state: { selectedTableIds: selectedTables.map((t) => t.Id) },
        });
    };

    const handleCancelSelect = () => {
        if (returnTo) {
            dispatch(updateTable({ tableNo: initialTableNoRef.current, tableIds: initialTableIdsRef.current }));
            navigate(-1);
            return;
        }
        setSelectedTables([]);
        dispatch(removeCustomer());
        navigate('/tables', { replace: true, state: null });
    };

    const statusLegend = [
        { label: 'Trống', color: '#3a3a3a' },
        { label: 'Ăn tại chỗ', color: '#14532d' },
        { label: 'Đã đặt trước', color: '#7a2f2f' },
    ];

    const handleOpenDetail = (table) => {
        setSelectedTable(table);
        setDetailOpen(true);
        if (!orders.length && !ordersLoading) {
            loadOrders();
        }
    };

    const latestOrder = useMemo(() => {
        if (!selectedTable?.Id) return null;
        const tableId = Number(selectedTable.Id);
        const candidates = (orders ?? [])
            .filter((o) => (Array.isArray(o?.tableIds) && o.tableIds.includes(tableId)) || Number(o?.TableId) === tableId);
        if (!candidates.length) return null;
        return candidates.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))[0];
    }, [orders, selectedTable]);

    const canEditOrder = latestOrder
        ? String(latestOrder?.Status ?? '').toLowerCase() !== 'completed'
        : false;

    const resolveOrderMethod = (table) => {
        const normalized = String(table?.Status ?? '').toLowerCase();
        if (['reserved', 'booked', 'đã đặt', 'đã đặt trước', '2'].includes(normalized)) {
            return 'reserved';
        }
        return 'dine_in';
    };
    return (
        <div className={`flex flex-col bg-[#1f1f1f] ${isSelectMode ? 'h-screen px-8 py-6' : 'h-[calc(100vh-5rem)] px-8 py-4'}
                        ${isSelectMode ? 'pb-6' : 'pb-28'}`}>
            <div className='flex justify-between items-center'>
                <div className='flex items-center gap-6'>
                    <h1 className='text-[#f5f5f5] text-3xl font-semibold'>
                        {isSelectMode ? 'Chọn bàn' : 'Bàn'}
                    </h1>
                    <div className='flex items-center gap-4'>
                        {statusLegend.map((item) => (
                            <div key={item.label} className='flex items-center gap-2 text-[#ababab] text-sm'>
                                <span className='h-3 w-3 rounded-full' style={{ backgroundColor: item.color }} />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <button onClick={() => setStatusType("all")} className={`
                                ${statusType === "all" ? "bg-[#414040]" : ""} 
                                text-[#ababab] text-lg px-3 py-3 font-semibold 
                                cursor-pointer rounded-lg`}>
                        Tất cả
                    </button>
                    <button onClick={() => setStatusType("available")} className={`
                                ${statusType === "available" ? "bg-[#414040]" : ""} 
                                text-[#ababab] text-lg px-3 py-3 font-semibold 
                                cursor-pointer rounded-lg`}>
                        Trống
                    </button>
                    <button onClick={() => setStatusType("booked")} className={`
                                ${statusType === "booked" ? "bg-[#414040]" : ""} 
                                text-[#ababab] text-lg px-3 py-3 font-semibold 
                                cursor-pointer rounded-lg`}>
                        Đã đặt
                    </button>
                    <button onClick={() => setStatusType("occupied")} className={`
                                ${statusType === "occupied" ? "bg-[#414040]" : ""} 
                                text-[#ababab] text-lg px-3 py-3 font-semibold 
                                cursor-pointer rounded-lg`}>
                        Ăn tại chỗ
                    </button>
                    <div className='flex items-center gap-2 ml-2 text-[#ababab] text-sm'>
                        <span>| Sắp xếp:</span>
                        <select
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value)}
                            className='bg-[#2a2a2a] text-[#ababab] px-3 py-2 rounded-lg text-sm focus:outline-none'>
                            <option value="tableNo">Số bàn</option>
                            <option value="seats">Số ghế</option>
                            <option value="name">Tên bàn</option>
                        </select>
                        <span>Theo chiều:</span>
                        <select
                            value={sortDir}
                            onChange={(e) => setSortDir(e.target.value)}
                            className='bg-[#2a2a2a] text-[#ababab] px-3 py-2 rounded-lg text-sm focus:outline-none'>
                            <option value="asc">Tăng dần</option>
                            <option value="desc">Giảm dần</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className='grid gap-5 py-4 flex-1 min-h-0 
                            grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8
                            h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide'>
                {
                    filteredTables.map((table) => {
                        return (
                            <TableCard
                                key={table.Id}
                                table={table}
                                onSelect={isSelectMode ? handleSelectTable : undefined}
                                onOpen={!isSelectMode ? handleOpenDetail : undefined}
                                selected={selectedTables.some((t) => t.Id === table.Id)}
                                statusOverride={originalSelectedIds.includes(table.Id) ? 'available' : undefined}
                            />
                        )
                    })
                }
            </div>
            {isSelectMode && (
                <div className='fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#262626] rounded-xl px-4 py-3
                                flex items-center gap-4 shadow-lg border border-[#333]'>
                    <div className='flex items-center gap-3 text-[#f5f5f5]'>
                        <span className='bg-[#3a3a3a] rounded-md px-3 py-1 text-sm'>
                            {isGuestKnown ? `${customer?.guests ?? 0} Khách` : 'Không xác định'}
                        </span>
                        <span className='text-[#ababab] text-sm'>
                            {selectedTables.length ? selectedTables.map((t) => t.Name).join(', ') : 'Chưa chọn bàn'}
                        </span>
                        <span className='text-[#ababab] text-sm'>
                            ({totalSeats} chỗ)
                        </span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button
                            className='px-4 py-2 rounded-lg font-semibold text-sm bg-[#3a3a3a] text-[#f5f5f5]'
                            onClick={handleCancelSelect}>
                            Hủy
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-semibold text-sm ${selectedTables.length ? 'bg-[#f6b100] text-[#1f1f1f]' : 'bg-[#3a3a3a] text-[#8a8a8a] cursor-not-allowed'}`}
                            onClick={handleConfirmSelect}
                            disabled={!selectedTables.length}>
                            Xác nhận
                        </button>
                    </div>
                </div>
            )}
            <TableDetailModal
                isOpen={isDetailOpen}
                onClose={() => setDetailOpen(false)}
                onDone={() => setDetailOpen(false)}
                onEdit={() => {
                    if (!selectedTable?.Id) return;
                    const orderTableIds = Array.isArray(latestOrder?.tableIds) && latestOrder.tableIds.length
                        ? latestOrder.tableIds
                        : (latestOrder?.TableId ? [latestOrder.TableId] : []);
                    const orderTableNames = Array.isArray(latestOrder?.tableNames) && latestOrder.tableNames.length
                        ? latestOrder.tableNames
                        : (typeof latestOrder?.TableNames === 'string' && latestOrder.TableNames.trim()
                            ? latestOrder.TableNames.split(',').map((name) => name.trim()).filter(Boolean)
                            : []);
                    if (latestOrder?.Id) {
                        dispatch(setEditMode({ editMode: true }));
                        dispatch(setOrderId({ orderId: String(latestOrder.Id) }));
                        if (orderTableIds.length) {
                            const names = orderTableNames.length
                                ? orderTableNames
                                : orderTableIds.map((id) => `Bàn ${id}`);
                            dispatch(updateTable({ tableNo: names.join(', '), tableIds: orderTableIds }));
                        } else {
                            dispatch(updateTable({ tableNo: selectedTable.Name, tableIds: [selectedTable.Id] }));
                        }
                    } else {
                        dispatch(setEditMode({ editMode: false }));
                        dispatch(setOrderId({ orderId: '' }));
                        dispatch(updateTable({ tableNo: selectedTable.Name, tableIds: [selectedTable.Id] }));
                    }
                    dispatch(clearCart());
                    const primaryTableId = orderTableIds?.includes(selectedTable.Id)
                        ? selectedTable.Id
                        : (orderTableIds?.[0] ?? selectedTable.Id);
                    navigate(`/tables/${primaryTableId}`, {
                        state: { orderMethod: resolveOrderMethod(selectedTable) },
                    });
                }}
                onView={() => {
                    if (!selectedTable?.Id) return;
                    dispatch(setEditMode({ editMode: false }));
                    dispatch(setOrderId({ orderId: String(latestOrder?.Id ?? '') }));
                    const viewTableIds = Array.isArray(latestOrder?.tableIds) && latestOrder.tableIds.length
                        ? latestOrder.tableIds
                        : (latestOrder?.TableId ? [latestOrder.TableId] : []);
                    const viewTableNames = Array.isArray(latestOrder?.tableNames) && latestOrder.tableNames.length
                        ? latestOrder.tableNames
                        : (typeof latestOrder?.TableNames === 'string' && latestOrder.TableNames.trim()
                            ? latestOrder.TableNames.split(',').map((name) => name.trim()).filter(Boolean)
                            : []);
                    if (viewTableIds.length) {
                        const names = viewTableNames.length
                            ? viewTableNames
                            : viewTableIds.map((id) => `Bàn ${id}`);
                        dispatch(updateTable({ tableNo: names.join(', '), tableIds: viewTableIds }));
                    } else {
                        dispatch(updateTable({ tableNo: selectedTable.Name, tableIds: [selectedTable.Id] }));
                    }
                    dispatch(clearCart());
                    const primaryTableId = viewTableIds?.includes(selectedTable.Id)
                        ? selectedTable.Id
                        : (viewTableIds?.[0] ?? selectedTable.Id);
                    navigate(`/tables/${primaryTableId}`, {
                        state: {
                            readOnly: true,
                            orderId: latestOrder?.Id ?? null,
                            orderMethod: resolveOrderMethod(selectedTable),
                        },
                    });
                }}
                table={selectedTable}
                order={latestOrder}
                canEdit={canEditOrder}
            />
        </div>
    )
}

export default Tables

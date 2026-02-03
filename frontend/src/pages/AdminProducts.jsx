import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../https/api';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    Number(value || 0),
  );

const AdminProducts = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const role = localStorage.getItem('role') || 'staff';
    if (role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/menu/items/all'),
        api.get('/menu/categories'),
      ]);
      setItems(itemsRes.data ?? []);
      setCategories(categoriesRes.data ?? []);
    };

    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [items, pageSize]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => map.set(cat.Id, cat.Name));
    return map;
  }, [categories]);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedItems = items.slice(startIndex, endIndex);

  return (
    <section className="flex flex-col bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-28">
      <div className="px-8 py-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[#f5f5f5] text-2xl font-semibold">Quản lý món ăn</h1>
          <button className="px-4 py-2 rounded-lg bg-[#2563eb] text-white font-semibold">
            Thêm món ăn
          </button>
        </div>

        <div className="bg-[#2b2a2a] rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[#ababab]">
                <tr>
                  <th className="py-3 px-3">Hình ảnh</th>
                  <th className="py-3 px-3">Tên món</th>
                  <th className="py-3 px-3">Giá</th>
                  <th className="py-3 px-3">Danh mục</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3">Kho</th>
                  <th className="py-3 px-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-[#f5f5f5]">
                {pagedItems.map((item) => (
                  <tr key={item.Id} className="border-t border-[#3a3a3a]">
                    <td className="py-3 px-3">
                      <div className="h-16 w-16 rounded-lg bg-[#1f1f1f] overflow-hidden">
                        {item.ImageUrl ? (
                          <img
                            src={item.ImageUrl}
                            alt={item.Name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[#ababab] text-xs">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold">{item.Name}</p>
                      {item.Description && (
                        <p className="text-[#ababab] text-xs mt-1 max-w-md">
                          {item.Description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#86efac] font-semibold">
                      {formatCurrency(item.Price)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-3 py-1 rounded-full bg-[#1f1f1f] text-[#93c5fd]">
                        {categoryMap.get(item.CategoryId) || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.IsActive
                            ? 'bg-[#1f3d2a] text-[#22c55e]'
                            : 'bg-[#3a3a3a] text-[#fca5a5]'
                        }`}
                      >
                        {item.IsActive ? 'Có sẵn' : 'Ngưng bán'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#ababab]">
                      {item.StockQty ?? 0} {item.StockUnit || ''}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded-md bg-[#2563eb] text-white text-xs">
                          Sửa
                        </button>
                        <button className="px-3 py-1 rounded-md bg-[#3a3a3a] text-white text-xs">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[#ababab]">
                      Chưa có dữ liệu món ăn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {items.length > 0 && (
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[#ababab] text-sm">
              <div className="flex items-center gap-3">
                <span>Hiển thị</span>
                <select
                  className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg px-3 py-2 text-[#f5f5f5]"
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>món / trang</span>
              </div>

              <div>
                {startIndex + 1}-{Math.min(endIndex, totalItems)} trên {totalItems}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-lg border border-[#3a3a3a] text-[#f5f5f5] disabled:opacity-40"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safePage === 1}
                >
                  Trước
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    const isActive = page === safePage;
                    return (
                      <button
                        key={page}
                        className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                          isActive
                            ? 'bg-[#2563eb] border-[#2563eb] text-white'
                            : 'border-[#3a3a3a] text-[#f5f5f5]'
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="px-3 py-2 rounded-lg border border-[#3a3a3a] text-[#f5f5f5] disabled:opacity-40"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safePage === totalPages}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminProducts;

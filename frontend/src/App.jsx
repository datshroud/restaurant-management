import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Home, Auth, Orders, Tables, PaymentReturn, Account } from './pages'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCategories from './pages/admin/AdminCategories'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminTables from './pages/admin/AdminTables'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPromos from './pages/admin/AdminPromos'
import Menu from './pages/Menu'
import AppLayout from './layouts/AppLayout'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/account" element={<Account />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="tables" element={<AdminTables />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="promos" element={<AdminPromos />} />
          </Route>
          <Route path="/tables/:id" element={<Menu />} />
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/payments/momo/return" element={<PaymentReturn />} />
          <Route path="/payments/vnpay/return" element={<PaymentReturn />} />
          {/* <Route path="/menu" element={<Menu/>}/>
          <Route path="*" element={<div>404 Not Found</div>} /> */}
        </Routes>
      </Router>
    </>
  )
}

export default App

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Home, Auth, Orders, Tables } from './pages'
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
          </Route>
          <Route path="/tables/:id" element={<Menu />} />
          <Route path="/auth" element={<Auth />} />
          {/* <Route path="/menu" element={<Menu/>}/>
          <Route path="*" element={<div>404 Not Found</div>} /> */}
        </Routes>
      </Router>
    </>
  )
}

export default App

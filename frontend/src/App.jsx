import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import {Home, Auth, Orders, Tables} from './pages'
import Header from './components/shared/Header'
import BottomNav from './components/shared/BottomNav'
function App() {
  return (
    <>
      <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/auth" element={<Auth />} />
          <Route path="/orders" element={<Orders/>} />
          <Route path="/tables" element={<Tables/>}/>
        </Routes>
        <BottomNav />
      </Router>
    </>
  )
}

export default App

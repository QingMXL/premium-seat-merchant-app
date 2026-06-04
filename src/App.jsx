import { Navigate, Route, Routes } from 'react-router-dom'
import { useMerchant } from './context/MerchantContext.jsx'
import Login     from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Bookings  from './pages/Bookings.jsx'
import Dishes    from './pages/Dishes.jsx'
import Rooms     from './pages/Rooms.jsx'
import Profile   from './pages/Profile.jsx'
import Analytics from './pages/Analytics.jsx'

function Guard({ children }) {
  const { session, loading } = useMerchant()
  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', color:'#94a3b8', fontSize:14 }}>
      加载中…
    </div>
  )
  return session ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
      <Route path="/bookings"  element={<Guard><Bookings /></Guard>} />
      <Route path="/dishes"    element={<Guard><Dishes /></Guard>} />
      <Route path="/rooms"     element={<Guard><Rooms /></Guard>} />
      <Route path="/profile"   element={<Guard><Profile /></Guard>} />
      <Route path="/analytics" element={<Guard><Analytics /></Guard>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

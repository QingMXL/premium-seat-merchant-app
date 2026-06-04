import { NavLink, useNavigate } from 'react-router-dom'
import { useMerchant } from '../context/MerchantContext.jsx'

const NAV = [
  { to: '/dashboard', icon: '◉', label: '今日概览' },
  { to: '/bookings',  icon: '≡', label: '预订管理' },
  { to: '/dishes',    icon: '✦', label: '菜品管理' },
  { to: '/rooms',     icon: '◻', label: '包间管理' },
  { to: '/profile',   icon: '◎', label: '餐厅资料' },
  { to: '/analytics', icon: '↗', label: '数据分析' },
]

export default function Layout({ children, title }) {
  const { merchant, restaurant, signOut } = useMerchant()
  const nav = useNavigate()

  async function handleSignOut() {
    await signOut()
    nav('/login', { replace: true })
  }

  const initials = (restaurant?.name || '餐').slice(0, 1)

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">{initials}</div>
          <div className="sidebar-name">{restaurant?.name || '加载中…'}</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">功能</div>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleSignOut} title="点击退出">
            <div className="user-avatar">{(merchant?.name || '商').slice(0, 1)}</div>
            <div className="user-info">
              <div className="user-name">{merchant?.name || '商家账户'}</div>
              <div className="user-role">点击退出</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-area">
        <header className="main-header">
          <div className="page-title">{title}</div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}

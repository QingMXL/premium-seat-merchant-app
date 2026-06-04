import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useMerchant } from '../context/MerchantContext.jsx'
import Layout from '../components/Layout.jsx'

const STATUS_TEXT = { unpaid: '待支付', pending: '待到店', done: '已完成', cancelled: '已取消' }
const STATUS_CLS  = { unpaid: 'badge-unpaid', pending: 'badge-pending',
                      done: 'badge-done', cancelled: 'badge-cancelled' }
const WEEKDAY = ['周日','周一','周二','周三','周四','周五','周六']

function fmtDate(d) {
  const dt = new Date(d + 'T00:00:00')
  return `${d}（${WEEKDAY[dt.getDay()]}）`
}

export default function Dashboard() {
  const { restaurant } = useMerchant()
  const nav = useNavigate()
  const [stats, setStats]     = useState({ total: 0, pending: 0, done: 0, revenue: 0 })
  const [recent, setRecent]   = useState([])
  const [loading, setLoading] = useState(true)

  const rid = restaurant?.id
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!rid) return
    async function load() {
      setLoading(true)
      const { data: todayOrders } = await supabase
        .from('orders').select('*')
        .eq('restaurant_id', rid)
        .eq('booking_date', today)
        .order('booking_time')
      const orderData = todayOrders || []

      // Fetch user profiles separately (no direct FK from orders to user_profiles)
      const uids = [...new Set(orderData.map(o => o.user_id))]
      const profiles = uids.length
        ? (await supabase.from('user_profiles').select('id, name, phone').in('id', uids)).data || []
        : []
      const pMap = Object.fromEntries(profiles.map(p => [p.id, p]))
      const orders = orderData.map(o => ({ ...o, user_profiles: pMap[o.user_id] || null }))
      const pending = orders.filter(o => o.status === 'pending').length
      const done    = orders.filter(o => o.status === 'done').length
      const revenue = orders
        .filter(o => o.status === 'done')
        .reduce((sum, o) => sum + (o.consumed || 0), 0)

      setStats({ total: orders.length, pending, done, revenue })
      setRecent(orders.slice(0, 8))
      setLoading(false)
    }
    load()
  }, [rid, today])

  if (!restaurant) return null

  return (
    <Layout title={`今日概览 · ${today}`}>
      {/* ── Stat Cards ── */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-label">今日预订</div>
          <div className="stat-value">{loading ? '—' : stats.total}</div>
          <div className="stat-sub">桌</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-label">待到店</div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>
            {loading ? '—' : stats.pending}
          </div>
          <div className="stat-sub">桌</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">已完成</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {loading ? '—' : stats.done}
          </div>
          <div className="stat-sub">桌</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">今日营收</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>
            {loading ? '—' : `¥${stats.revenue.toLocaleString()}`}
          </div>
          <div className="stat-sub">已完成订单合计</div>
        </div>
      </div>

      {/* ── Recent Bookings ── */}
      <div className="card mt-24">
        <div className="card-header">
          <span className="card-title">今日预订列表</span>
          <button className="btn btn-secondary btn-sm" onClick={() => nav('/bookings')}>
            查看全部 →
          </button>
        </div>
        {loading ? (
          <div className="empty-state"><div className="text-muted">加载中…</div></div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-text">今日暂无预订</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>顾客</th>
                <th>时间</th>
                <th>人数</th>
                <th>区域 / 桌位</th>
                <th>定金</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(o => (
                <tr key={o.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.user_profiles?.name || '—'}</div>
                    <div className="text-sm text-muted">{o.user_profiles?.phone || ''}</div>
                  </td>
                  <td>{o.booking_time?.slice(0, 5)}</td>
                  <td>{o.party_size} 人</td>
                  <td>{o.area} · {o.table_label}</td>
                  <td>¥{o.deposit}</td>
                  <td>
                    <span className={`badge ${STATUS_CLS[o.status]}`}>
                      {STATUS_TEXT[o.status]}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm"
                      onClick={() => nav('/bookings')}>详情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}

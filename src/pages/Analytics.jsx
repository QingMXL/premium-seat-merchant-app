import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useMerchant } from '../context/MerchantContext.jsx'
import Layout from '../components/Layout.jsx'

const WEEKDAY = ['日','一','二','三','四','五','六']

function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}

export default function Analytics() {
  const { restaurant } = useMerchant()
  const [orders, setOrders]   = useState([])
  const [range, setRange]     = useState('7')
  const [loading, setLoading] = useState(true)

  const rid = restaurant?.id

  useEffect(() => {
    if (!rid) return
    async function load() {
      setLoading(true)
      const from = new Date()
      from.setDate(from.getDate() - parseInt(range))
      const { data } = await supabase.from('orders').select('*')
        .eq('restaurant_id', rid)
        .gte('booking_date', from.toISOString().slice(0, 10))
        .order('booking_date')
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [rid, range])

  // ── Derived stats ──
  const total    = orders.length
  const done     = orders.filter(o => o.status === 'done').length
  const revenue  = orders.filter(o => o.status === 'done').reduce((s, o) => s + (o.consumed || 0), 0)
  const avgParty = total ? (orders.reduce((s, o) => s + o.party_size, 0) / total).toFixed(1) : 0

  // Bookings per day (last 7 days)
  const days = last7Days()
  const byDay = days.map(d => ({
    label: WEEKDAY[new Date(d+'T00:00:00').getDay()],
    date: d,
    count: orders.filter(o => o.booking_date === d).length,
  }))
  const maxCount = Math.max(...byDay.map(d => d.count), 1)

  // Status distribution
  const statusDist = [
    { label: '待支付', key: 'unpaid',    color: '#f97316' },
    { label: '待到店', key: 'pending',   color: '#3b82f6' },
    { label: '已完成', key: 'done',      color: '#10b981' },
    { label: '已取消', key: 'cancelled', color: '#94a3b8' },
  ].map(s => ({ ...s, count: orders.filter(o => o.status === s.key).length }))

  // Hourly distribution
  const byHour = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: h + ':00',
    count: orders.filter(o => parseInt(o.booking_time) === h).length,
  })).filter(h => h.count > 0).sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <Layout title="数据分析">
      {/* ── Range selector ── */}
      <div style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center' }}>
        <span style={{ fontSize:13, color:'var(--text-2)' }}>统计周期：</span>
        <div className="tab-bar">
          {[['7','近 7 天'],['30','近 30 天'],['90','近 90 天']].map(([v, l]) => (
            <div key={v} className={`tab ${range === v ? 'active' : ''}`}
              onClick={() => setRange(v)}>{l}</div>
          ))}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="stat-grid" style={{ marginBottom:20 }}>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-label">总预订</div>
          <div className="stat-value">{loading ? '—' : total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">已完成</div>
          <div className="stat-value" style={{ color:'var(--success)' }}>
            {loading ? '—' : done}
          </div>
          <div className="stat-sub">完成率 {total ? Math.round(done/total*100) : 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">累计营收</div>
          <div className="stat-value" style={{ fontSize:22, color:'var(--accent)' }}>
            {loading ? '—' : `¥${revenue.toLocaleString()}`}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">平均人数</div>
          <div className="stat-value">{loading ? '—' : avgParty}</div>
          <div className="stat-sub">人 / 桌</div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* ── Daily Bar Chart ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">近 7 天预订趋势</span></div>
          <div className="card-body">
            <div className="bar-chart">
              {byDay.map(d => (
                <div className="bar-wrap" key={d.date}>
                  <div className="bar-val">{d.count || ''}</div>
                  <div className="bar"
                    style={{ height: `${Math.round((d.count / maxCount) * 100)}%` }} />
                  <div className="bar-label">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Status Donut ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">订单状态分布</span></div>
          <div className="card-body">
            <div className="donut-legend">
              {statusDist.map(s => (
                <div className="legend-row" key={s.key}>
                  <div className="legend-dot" style={{ background: s.color }} />
                  <span style={{ flex:1, color:'var(--text-2)' }}>{s.label}</span>
                  <strong>{s.count}</strong>
                  <span className="text-muted" style={{ width:36, textAlign:'right' }}>
                    {total ? Math.round(s.count/total*100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Peak Hours ── */}
      {byHour.length > 0 && (
        <div className="card mt-16">
          <div className="card-header"><span className="card-title">高峰时段 Top 5</span></div>
          <div className="card-body">
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {byHour.map((h, i) => (
                <div key={h.hour} style={{ flex:1, minWidth:100, padding:'12px',
                  background:'var(--body)', borderRadius:8, textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:4 }}>
                    #{i+1}
                  </div>
                  <div style={{ fontSize:18, fontWeight:700, color:'var(--accent)' }}>
                    {h.label}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-2)', marginTop:2 }}>
                    {h.count} 桌
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

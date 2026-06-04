import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useMerchant } from '../context/MerchantContext.jsx'
import Layout from '../components/Layout.jsx'
import Modal from '../components/Modal.jsx'

const TABS = [
  { key: 'all',       label: '全部' },
  { key: 'unpaid',    label: '待支付' },
  { key: 'pending',   label: '待到店' },
  { key: 'done',      label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]
const STATUS_TEXT = { unpaid: '待支付', pending: '待到店', done: '已完成', cancelled: '已取消' }
const STATUS_CLS  = { unpaid: 'badge-unpaid', pending: 'badge-pending',
                      done: 'badge-done', cancelled: 'badge-cancelled' }
const WEEKDAY = ['周日','周一','周二','周三','周四','周五','周六']
function fmtDate(d) { const dt = new Date(d+'T00:00:00'); return `${d}（${WEEKDAY[dt.getDay()]}）` }

export default function Bookings() {
  const { restaurant } = useMerchant()
  const [tab, setTab]         = useState('all')
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail]   = useState(null)  // order for detail modal
  const [saving, setSaving]   = useState(false)
  const [dateFilter, setDateFilter] = useState('')

  const rid = restaurant?.id

  async function load() {
    if (!rid) return
    setLoading(true)

    // Step 1: fetch orders
    let q = supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', rid)
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false })
    if (dateFilter) q = q.eq('booking_date', dateFilter)
    const { data: orderData } = await q

    if (!orderData?.length) { setOrders([]); setLoading(false); return }

    // Step 2: fetch user profiles for those orders
    const uids = [...new Set(orderData.map(o => o.user_id))]
    const { data: profiles } = await supabase
      .from('user_profiles').select('id, name, phone').in('id', uids)
    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))

    setOrders(orderData.map(o => ({ ...o, user_profiles: profileMap[o.user_id] || null })))
    setLoading(false)
  }

  useEffect(() => { load() }, [rid, dateFilter])

  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab)

  async function updateStatus(orderId, newStatus) {
    setSaving(true)
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    setSaving(false)
    setDetail(null)
    load()
  }

  const counts = orders.reduce((m, o) => { m[o.status] = (m[o.status] || 0) + 1; return m }, {})

  return (
    <Layout title="预订管理">
      {/* ── Filters ── */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
        <div className="tab-bar">
          {TABS.map(t => (
            <div key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}>
              {t.label}
              {t.key !== 'all' && counts[t.key] > 0 &&
                <span style={{ marginLeft:4, background:'var(--accent)', color:'#fff',
                  borderRadius:10, padding:'0 5px', fontSize:10 }}>{counts[t.key]}</span>}
            </div>
          ))}
        </div>
        <input type="date" className="filter-select" value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{ marginLeft:'auto' }} />
        {dateFilter && (
          <button className="btn btn-secondary btn-sm" onClick={() => setDateFilter('')}>
            清除日期
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="card">
        {loading ? (
          <div className="empty-state"><div className="text-muted">加载中…</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-text">暂无订单</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>顾客</th>
                <th>日期</th>
                <th>时间</th>
                <th>人数</th>
                <th>区域 / 桌位</th>
                <th>定金</th>
                <th>消费</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td><span className="text-sm text-muted">{o.id}</span></td>
                  <td>
                    <div style={{ fontWeight:500 }}>{o.user_profiles?.name || '—'}</div>
                    <div className="text-sm text-muted">{o.user_profiles?.phone || ''}</div>
                  </td>
                  <td>{fmtDate(o.booking_date)}</td>
                  <td>{o.booking_time?.slice(0,5)}</td>
                  <td>{o.party_size} 人</td>
                  <td>{o.area} · {o.table_label}</td>
                  <td>¥{o.deposit}</td>
                  <td>{o.consumed > 0 ? `¥${o.consumed}` : '—'}</td>
                  <td>
                    <span className={`badge ${STATUS_CLS[o.status]}`}>
                      {STATUS_TEXT[o.status]}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => setDetail(o)}>详情</button>
                      {o.status === 'pending' && (
                        <button className="btn btn-success btn-sm"
                          disabled={saving}
                          onClick={() => updateStatus(o.id, 'done')}>
                          核销
                        </button>
                      )}
                      {(o.status === 'unpaid' || o.status === 'pending') && (
                        <button className="btn btn-danger btn-sm"
                          disabled={saving}
                          onClick={() => updateStatus(o.id, 'cancelled')}>
                          取消
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <Modal open={!!detail} onClose={() => setDetail(null)}
        title={`订单详情 · ${detail?.id || ''}`} size="modal-lg"
        footer={
          <div style={{ display:'flex', gap:8 }}>
            {detail?.status === 'pending' && (
              <button className="btn btn-success" disabled={saving}
                onClick={() => updateStatus(detail.id, 'done')}>
                ✓ 核销到店
              </button>
            )}
            {(detail?.status === 'unpaid' || detail?.status === 'pending') && (
              <button className="btn btn-danger" disabled={saving}
                onClick={() => updateStatus(detail.id, 'cancelled')}>
                取消订单
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => setDetail(null)}>关闭</button>
          </div>
        }>
        {detail && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 24px' }}>
            {[
              ['顾客姓名', detail.user_profiles?.name || '—'],
              ['联系电话', detail.user_profiles?.phone || '—'],
              ['预订日期', fmtDate(detail.booking_date)],
              ['预订时间', detail.booking_time?.slice(0,5)],
              ['用餐人数', `${detail.party_size} 人`],
              ['用餐区域', detail.area],
              ['桌位',     detail.table_label],
              ['状态',     <span key="s" className={`badge ${STATUS_CLS[detail.status]}`}>{STATUS_TEXT[detail.status]}</span>],
              ['已付定金', `¥${detail.deposit}`],
              ['实际消费', detail.consumed > 0 ? `¥${detail.consumed}` : '—'],
              ['取消原因', detail.cancel_reason || '—'],
              ['退款状态', detail.refund_status || '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-sm text-muted" style={{ marginBottom:2 }}>{k}</div>
                <div style={{ fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Layout>
  )
}

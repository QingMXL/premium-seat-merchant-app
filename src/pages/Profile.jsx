import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useMerchant } from '../context/MerchantContext.jsx'
import Layout from '../components/Layout.jsx'

export default function Profile() {
  const { restaurant, refreshRestaurant } = useMerchant()
  const [form, setForm]     = useState(null)
  const [tags, setTags]     = useState([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    if (!restaurant) return
    setForm({ ...restaurant })
    loadTags()
  }, [restaurant?.id])

  async function loadTags() {
    if (!restaurant?.id) return
    const { data } = await supabase.from('restaurant_tags')
      .select('tag').eq('restaurant_id', restaurant.id)
    setTags((data || []).map(t => t.tag))
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSave(e) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    const { id, created_at, ...fields } = form
    await supabase.from('restaurants').update(fields).eq('id', id)
    setSaving(false)
    setSaved(true)
    refreshRestaurant()
    setTimeout(() => setSaved(false), 2500)
  }

  async function addTag() {
    const t = tagInput.trim()
    if (!t || tags.includes(t)) return
    await supabase.from('restaurant_tags').insert({ restaurant_id: restaurant.id, tag: t })
    setTags(ts => [...ts, t])
    setTagInput('')
  }

  async function removeTag(t) {
    await supabase.from('restaurant_tags').delete()
      .eq('restaurant_id', restaurant.id).eq('tag', t)
    setTags(ts => ts.filter(x => x !== t))
  }

  if (!form) return <Layout title="餐厅资料"><div className="empty-state"><div className="text-muted">加载中…</div></div></Layout>

  return (
    <Layout title="餐厅资料">
      <div style={{ maxWidth: 720 }}>
        <form onSubmit={handleSave}>
          {/* ── Basic Info ── */}
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-header"><span className="card-title">基本信息</span></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">餐厅名称</label>
                  <input className="form-input" value={form.name} onChange={set('name')} />
                </div>
                <div className="form-group">
                  <label className="form-label">展示标签</label>
                  <input className="form-input" value={form.tag} onChange={set('tag')}
                    placeholder="如：私房菜、臻选" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">菜系</label>
                  <input className="form-input" value={form.cuisine} onChange={set('cuisine')} />
                </div>
                <div className="form-group">
                  <label className="form-label">人均消费（元）</label>
                  <input className="form-input" type="number" value={form.price} onChange={set('price')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">简介</label>
                <textarea className="form-input" rows={3} value={form.intro} onChange={set('intro')} />
              </div>
            </div>
          </div>

          {/* ── Contact & Location ── */}
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-header"><span className="card-title">联系与位置</span></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">电话</label>
                  <input className="form-input" value={form.phone} onChange={set('phone')} />
                </div>
                <div className="form-group">
                  <label className="form-label">区域</label>
                  <input className="form-input" value={form.district} onChange={set('district')}
                    placeholder="徐汇区 · 永福路" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">详细地址</label>
                <input className="form-input" value={form.address} onChange={set('address')} />
              </div>
              <div className="form-group">
                <label className="form-label">营业时间</label>
                <input className="form-input" value={form.hours} onChange={set('hours')}
                  placeholder="午餐 11:30-14:30 · 晚餐 17:30-22:00" />
              </div>
            </div>
          </div>

          {/* ── Booking Settings ── */}
          <div className="card" style={{ marginBottom:16 }}>
            <div className="card-header"><span className="card-title">预订设置</span></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">预订定金（元）</label>
                  <input className="form-input" type="number" value={form.deposit} onChange={set('deposit')} />
                </div>
                <div className="form-group">
                  <label className="form-label">最近可订时段</label>
                  <input className="form-input" value={form.next_slot} onChange={set('next_slot')}
                    placeholder="今晚 19:00" />
                </div>
              </div>
              <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
                {[
                  ['has_room', '有包间'],
                  ['has_parking', '可停车'],
                  ['can_book', '可在线预订'],
                  ['tonight', '今晚可订'],
                  ['floor_plan_enabled', '启用平面图'],
                ].map(([k, label]) => (
                  <label key={k} style={{ display:'flex', alignItems:'center', gap:8,
                    fontSize:13, cursor:'pointer' }}>
                    <input type="checkbox" checked={!!form[k]}
                      onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '保存中…' : '保存修改'}
            </button>
            {saved && <span style={{ color:'var(--success)', fontSize:13 }}>✓ 已保存</span>}
          </div>
        </form>

        {/* ── Tags ── */}
        <div className="card mt-16">
          <div className="card-header"><span className="card-title">餐厅标签</span></div>
          <div className="card-body">
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
              {tags.map(t => (
                <span key={t} style={{ display:'inline-flex', alignItems:'center', gap:6,
                  padding:'4px 10px', background:'var(--accent-light)', color:'var(--accent)',
                  borderRadius:20, fontSize:13 }}>
                  {t}
                  <span style={{ cursor:'pointer', opacity:.6 }} onClick={() => removeTag(t)}>×</span>
                </span>
              ))}
              {tags.length === 0 && <span className="text-muted">暂无标签</span>}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input className="form-input" style={{ maxWidth:200 }}
                value={tagInput} onChange={e => setTagInput(e.target.value)}
                placeholder="输入标签名" onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addTag()} }} />
              <button type="button" className="btn btn-secondary" onClick={addTag}>添加</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useMerchant } from '../context/MerchantContext.jsx'
import Layout from '../components/Layout.jsx'
import Modal from '../components/Modal.jsx'

const EMPTY_DISH = { name: '', price: '', tag: '', img_url: '', likes: 0, is_trending: false }

export default function Dishes() {
  const { restaurant } = useMerchant()
  const [dishes, setDishes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)  // dish object | null
  const [form, setForm]       = useState(EMPTY_DISH)
  const [saving, setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const rid = restaurant?.id

  async function load() {
    if (!rid) return
    setLoading(true)
    const { data } = await supabase.from('dishes').select('*')
      .eq('restaurant_id', rid).order('id')
    setDishes(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [rid])

  function openAdd()    { setEditing(null); setForm(EMPTY_DISH); setModal(true) }
  function openEdit(d)  { setEditing(d); setForm({ ...d, price: String(d.price) }); setModal(true) }
  function closeModal() { setModal(false); setEditing(null) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, price: parseInt(form.price) || 0, restaurant_id: rid }
    if (editing) {
      await supabase.from('dishes').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('dishes').insert(payload)
    }
    setSaving(false)
    closeModal()
    load()
  }

  async function handleDelete() {
    if (!deleteId) return
    await supabase.from('dishes').delete().eq('id', deleteId)
    setDeleteId(null)
    load()
  }

  async function toggleTrending(d) {
    await supabase.from('dishes').update({ is_trending: !d.is_trending }).eq('id', d.id)
    load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <Layout title="菜品管理">
      <div className="section-header">
        <span className="section-title">共 {dishes.length} 道菜品</span>
        <button className="btn btn-primary" onClick={openAdd}>＋ 新增菜品</button>
      </div>

      {loading ? (
        <div className="empty-state"><div className="text-muted">加载中…</div></div>
      ) : dishes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽</div>
          <div className="empty-text">还没有菜品</div>
          <button className="btn btn-primary" onClick={openAdd}>添加第一道菜</button>
        </div>
      ) : (
        <div className="item-grid">
          {dishes.map(d => (
            <div className="item-card" key={d.id}>
              <div className="item-img">
                {d.img_url
                  ? <img src={d.img_url} alt={d.name} />
                  : <div className="item-img-placeholder">🍽</div>}
              </div>
              <div className="item-body">
                <div className="item-name">{d.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                  <span className="item-price">¥{d.price}</span>
                  {d.tag && <span className="item-tag">{d.tag}</span>}
                  {d.is_trending && <span className="item-tag trending-badge">热门</span>}
                </div>
                <div className="item-meta" style={{ marginTop:4 }}>
                  {d.likes > 0 ? `❤ ${d.likes} 人喜欢` : ''}
                </div>
              </div>
              <div className="item-actions">
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-2)', flex:1 }}>
                  <div className={`toggle ${d.is_trending ? 'on' : ''}`}
                    onClick={() => toggleTrending(d)} title="切换热门" />
                  热门
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>编辑</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(d.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal open={modal} onClose={closeModal}
        title={editing ? '编辑菜品' : '新增菜品'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>取消</button>
            <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? '保存中…' : '保存'}
            </button>
          </>
        }>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">菜品名称 *</label>
            <input className="form-input" required value={form.name} onChange={set('name')} placeholder="如：葱油东星斑" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">价格（元）*</label>
              <input className="form-input" type="number" required min="0" value={form.price} onChange={set('price')} placeholder="388" />
            </div>
            <div className="form-group">
              <label className="form-label">标签</label>
              <select className="form-input" value={form.tag} onChange={set('tag')}>
                <option value="">无</option>
                <option value="招牌菜">招牌菜</option>
                <option value="必点">必点</option>
                <option value="推荐">推荐</option>
                <option value="新品">新品</option>
                <option value="季节限定">季节限定</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">图片 URL</label>
            <input className="form-input" value={form.img_url} onChange={set('img_url')} placeholder="https://…" />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div className={`toggle ${form.is_trending ? 'on' : ''}`}
              onClick={() => setForm(f => ({ ...f, is_trending: !f.is_trending }))} />
            <span style={{ fontSize:13 }}>标记为热门菜品</span>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ── */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="确认删除"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>取消</button>
            <button className="btn btn-danger" onClick={handleDelete}>确认删除</button>
          </>
        }>
        <p style={{ color:'var(--text-2)' }}>删除后不可恢复，确认删除该菜品吗？</p>
      </Modal>
    </Layout>
  )
}

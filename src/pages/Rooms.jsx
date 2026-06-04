import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useMerchant } from '../context/MerchantContext.jsx'
import Layout from '../components/Layout.jsx'
import Modal from '../components/Modal.jsx'

const EMPTY = { name: '', min_spend: '', img_url: '', capacity_min: '', capacity_max: '' }

export default function Rooms() {
  const { restaurant } = useMerchant()
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const rid = restaurant?.id

  async function load() {
    if (!rid) return
    setLoading(true)
    const { data } = await supabase.from('rooms').select('*')
      .eq('restaurant_id', rid).order('id')
    setRooms(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [rid])

  function openAdd()   { setEditing(null); setForm(EMPTY); setModal(true) }
  function openEdit(r) { setEditing(r); setForm({
    ...r,
    capacity_min: String(r.capacity_min),
    capacity_max: String(r.capacity_max),
  }); setModal(true) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      restaurant_id: rid,
      capacity_min: parseInt(form.capacity_min) || 0,
      capacity_max: parseInt(form.capacity_max) || 0,
    }
    if (editing) await supabase.from('rooms').update(payload).eq('id', editing.id)
    else         await supabase.from('rooms').insert(payload)
    setSaving(false)
    setModal(false)
    load()
  }

  async function handleDelete() {
    await supabase.from('rooms').delete().eq('id', deleteId)
    setDeleteId(null)
    load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <Layout title="包间管理">
      <div className="section-header">
        <span className="section-title">共 {rooms.length} 间包间</span>
        <button className="btn btn-primary" onClick={openAdd}>＋ 新增包间</button>
      </div>

      {loading ? (
        <div className="empty-state"><div className="text-muted">加载中…</div></div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◻</div>
          <div className="empty-text">还没有包间</div>
          <button className="btn btn-primary" onClick={openAdd}>添加包间</button>
        </div>
      ) : (
        <div className="item-grid">
          {rooms.map(r => (
            <div className="item-card" key={r.id}>
              <div className="item-img">
                {r.img_url
                  ? <img src={r.img_url} alt={r.name} />
                  : <div className="item-img-placeholder">◻</div>}
              </div>
              <div className="item-body">
                <div className="item-name">{r.name}</div>
                <div style={{ marginTop:4 }}>
                  <span className="item-tag">{r.capacity_min}–{r.capacity_max} 人</span>
                </div>
                <div style={{ marginTop:6, fontSize:15, fontWeight:700, color:'var(--accent)' }}>
                  {r.min_spend}
                </div>
              </div>
              <div className="item-actions">
                <button className="btn btn-secondary btn-sm" style={{ flex:1 }}
                  onClick={() => openEdit(r)}>编辑</button>
                <button className="btn btn-danger btn-sm"
                  onClick={() => setDeleteId(r.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editing ? '编辑包间' : '新增包间'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>取消</button>
            <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? '保存中…' : '保存'}
            </button>
          </>
        }>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">包间名称 *</label>
            <input className="form-input" required value={form.name} onChange={set('name')}
              placeholder="如：外滩厅 10-12 人" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">最少人数</label>
              <input className="form-input" type="number" min="1" value={form.capacity_min}
                onChange={set('capacity_min')} placeholder="6" />
            </div>
            <div className="form-group">
              <label className="form-label">最多人数</label>
              <input className="form-input" type="number" min="1" value={form.capacity_max}
                onChange={set('capacity_max')} placeholder="8" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">最低消费</label>
            <input className="form-input" value={form.min_spend} onChange={set('min_spend')}
              placeholder="¥ 3888 起" />
          </div>
          <div className="form-group">
            <label className="form-label">图片 URL</label>
            <input className="form-input" value={form.img_url} onChange={set('img_url')}
              placeholder="https://…" />
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="确认删除"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>取消</button>
            <button className="btn btn-danger" onClick={handleDelete}>确认删除</button>
          </>
        }>
        <p style={{ color:'var(--text-2)' }}>删除后不可恢复，确认删除该包间吗？</p>
      </Modal>
    </Layout>
  )
}

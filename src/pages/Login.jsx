import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useMerchant } from '../context/MerchantContext.jsx'

export default function Login() {
  const { session, signIn } = useMerchant()
  const nav = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // 已登录（或登录成功后 session 异步写入）直接进入工作台，
  // 避免 signIn 与 onAuthStateChange 之间的竞态把用户卡在登录页
  if (session) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      nav('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || '邮箱或密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">◈ 商家管理</div>
        <div className="login-subtitle">餐厅运营管理后台</div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">邮箱</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="merchant@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary full-width"
            style={{ justifyContent: 'center', height: 40, marginTop: 8 }}
            disabled={loading}
          >
            {loading ? '登录中…' : '登录'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '12px', background: '#f8fafc',
          borderRadius: 8, fontSize: 12, color: '#64748b' }}>
          <strong>提示</strong><br />
          请使用商家账号登录，账号由管理员分配。
        </div>
      </div>
    </div>
  )
}

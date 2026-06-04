# 臻选好餐厅 · 商家管理后台

> 餐厅运营管理 Web 应用，供商家登录后管理预订、菜品、包间及查看运营数据。
> 与消费者端共用同一 Supabase 数据库，独立部署。

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ 功能概览

| 页面 | 功能 |
|------|------|
| **今日概览** | 今日预订数、待到店、已完成、营收统计；最近预订列表 |
| **预订管理** | 全量订单表格，按状态/日期筛选，一键核销/取消，查看顾客信息 |
| **菜品管理** | 卡片网格，新增/编辑/删除菜品，切换热门标记 |
| **包间管理** | 包间 CRUD，管理容量、最低消费 |
| **餐厅资料** | 编辑营业时间、简介、地址、电话、标签等全部餐厅信息 |
| **数据分析** | 近 7/30/90 天预订趋势图、订单状态分布、高峰时段 Top 5 |

---

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 18 + React Router v6 |
| 构建工具 | Vite 5 |
| 后端 / 数据库 | Supabase（PostgreSQL + PostgREST + Auth） |
| 认证 | Supabase Auth（邮箱 + 密码） |
| 样式 | 纯 CSS（CSS 变量，管理后台风格，无 UI 库） |

---

## 📁 项目结构

```
src/
├── lib/
│   └── supabase.js           # Supabase 客户端（从 .env 读取）
├── context/
│   └── MerchantContext.jsx   # 商家认证状态 + 餐厅数据
├── components/
│   ├── Layout.jsx            # 侧边栏 + 顶部栏布局
│   └── Modal.jsx             # 通用弹窗
├── pages/
│   ├── Login.jsx             # 登录页
│   ├── Dashboard.jsx         # 今日概览
│   ├── Bookings.jsx          # 预订管理
│   ├── Dishes.jsx            # 菜品管理
│   ├── Rooms.jsx             # 包间管理
│   ├── Profile.jsx           # 餐厅资料
│   └── Analytics.jsx         # 数据分析
└── styles/
    └── global.css            # 全局样式 + Design Token
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone git@github.com:QingMXL/premium-seat-merchant-app.git
cd premium-seat-merchant-app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入你的 Supabase 项目信息：

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_KEY=<your-supabase-key>
```

> **在哪里找这些值？**  
> Supabase 控制台 → Project Settings → API

### 4. 初始化数据库

商家端依赖消费者端的核心数据库结构。请确保已执行：

```
001_schema.sql   # 核心建表
002_seed.sql     # 初始数据
003_merchant.sql # 商家表 + RLS 策略
```

创建商家账号：

```bash
node supabase-setup/create_merchant.mjs
```

### 5. 启动开发服务器

```bash
npm run dev
# → http://localhost:5174
```

---

## 🗄 数据库依赖

商家端在消费者端数据库基础上新增：

| 表 | 说明 |
|----|------|
| `merchants` | 商家账户，关联 `auth.users` ↔ `restaurants` |

新增 RLS 策略（允许商家操作自己的餐厅数据）：

| 表 | 操作 |
|----|------|
| `restaurants` | UPDATE（仅本餐厅）|
| `dishes` | INSERT / UPDATE / DELETE（仅本餐厅）|
| `rooms` | INSERT / UPDATE / DELETE（仅本餐厅）|
| `orders` | SELECT / UPDATE（仅本餐厅）|
| `user_profiles` | SELECT（仅本餐厅的顾客）|
| `restaurant_tags` | INSERT / DELETE（仅本餐厅）|

---

## 🔒 安全说明

- 所有密钥通过 `.env` 注入，`.env` 已加入 `.gitignore`，**不会提交到 Git**
- 商家通过 **Supabase Auth**（邮箱 + 密码）登录，使用真实 JWT 认证
- RLS 策略确保每个商家只能访问和修改自己餐厅的数据
- 生产环境推荐使用 `anon key`，开发环境可使用 `service_role`（跳过 RLS）

---

## 📦 构建部署

```bash
npm run build   # 产物输出到 dist/
```

Vercel 部署需要在控制台 **Settings → Environment Variables** 中配置：

| 变量名 | 值 |
|--------|----|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_KEY` | Supabase API Key |

---

## 🔗 相关项目

| 项目 | 仓库 | 说明 |
|------|------|------|
| 消费者端 | [premium-seat-booking-app](https://github.com/QingMXL/premium-seat-booking-app) | 用户预订小程序 |
| 商家端 | 本仓库 | 餐厅运营管理后台 |

---

## 📄 License

MIT © 2026

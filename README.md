<h1 align="center">🏪 臻选餐厅预订 · 商家端</h1>

<p align="center"><b>每一桌，尽在掌握 · Every table, under control</b></p>
<p align="center"><i>「臻选餐厅预订」平台的商家管理端（B 端）—— 餐厅接单确认、到店核销、桌台与菜品管理的运营后台</i></p>

<p align="center">
  <a href="./README.md"><img src="https://img.shields.io/badge/lang-简体中文-0E3D33?style=for-the-badge" alt="简体中文"></a>
  <a href="./README.en.md"><img src="https://img.shields.io/badge/lang-English-B8923F?style=for-the-badge" alt="English"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=fff&labelColor=20232A" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=fff" />
  <img src="https://img.shields.io/badge/Supabase-Auth_+_RLS-3ECF8E?logo=supabase&logoColor=fff" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## 🖥 界面预览

<p align="center">
  <img src="screenshots/merchant-dashboard.png" width="100%" alt="今日概览 · 经营看板" />
</p>
<p align="center">
  <img src="screenshots/merchant-bookings.png" width="49.5%" alt="预订管理 · 核销与取消" />
  <img src="screenshots/merchant-login.png" width="49.5%" alt="商家登录" />
</p>
<p align="center"><sub>今日概览 · 预订管理 · 商家登录（Supabase Auth 登录，仅可见本店数据）</sub></p>

## 🌟 项目简介

这是「**臻选餐厅预订**」三端平台中的**商家端**：用户端的食客支付定金下单后，订单实时出现在这里 —— 商家登录自己的餐厅工作台，在今日概览看板掌握当日预订/待到店/营收，在预订管理中确认订单、查看顾客信息、到店一键核销或按规则取消退款，并自助维护菜品（热门标记）、包间（容量/最低消费）与餐厅资料；基于 Supabase Auth + 行级安全（RLS），每个商家账号只能看到和操作自己餐厅的数据。

## ✨ 核心功能

| 页面 | 功能 |
|------|------|
| 📊 今日概览 | 今日预订 / 待到店 / 已完成 / 营收四指标 + 当日预订列表 |
| 📋 预订管理 | 全量订单表格，按状态/日期筛选，一键核销、取消退款，查看顾客信息 |
| 🍽 菜品管理 | 菜品 CRUD、热门标记切换 |
| 🚪 包间管理 | 包间 CRUD、容量与最低消费 |
| 🏛 餐厅资料 | 名称/菜系/地址/营业时间/人均/简介维护 |
| 📈 数据分析 | 近 7/30/90 天预订趋势、订单状态分布、高峰时段 Top 5 |

## 🚀 快速开始

```bash
npm install
cp .env.example .env      # 填入 Supabase URL 与 Key
npm run dev               # → http://localhost:5174
```

演示账号：`merchant@yongfuhui.com / Merchant@2024`（雍福会）· `merchant@yuzhilan.com / Merchant@2024`（玉芝兰）
账号由 `create_merchant.mjs` 创建，经 `merchants` 表绑定餐厅。

## 🔒 权限模型

- 商家经 **Supabase Auth** 邮箱密码登录
- **RLS 行级安全**：`merchants` 表绑定 `auth.users ↔ restaurant`，商家仅能读写本店的餐厅资料 / 菜品 / 包间 / 订单
- 生产环境使用 anon key + RLS；service_role 仅限本地开发

## 🛠 技术栈

React 18 · Vite 5 · React Router v6 · Supabase（PostgreSQL + PostgREST + Auth）· 纯 CSS 管理后台风格（无 UI 库）

## 🔗 同系列仓库

| 仓库 | 角色 |
|------|------|
| [premium-seat-booking-app](https://github.com/QingMXL/premium-seat-booking-app) | 用户端（C 端）：发现餐厅、平面图选座、定金锁座 |
| **premium-seat-merchant-app**（本仓库） | 商家端（B 端） |

## 📄 License

MIT © 2026

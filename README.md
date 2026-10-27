# Contract & Service Hub — 合同与服务管理平台

跟 Project Hub 同一套系统（登录、权限、Section、栏位模板、筛选、日历、导出、封存/还原全部一样），但**数据、用户名单、后端完全独立**：

- 网址：<https://asana-sec.github.io/contract-hub/>
- **Super admin（3 位）**：`sam.secov@gmail.com`、`szesian.mitosc@gmail.com`、`eileen.secov@gmail.com`（写在 `assets/core.js` 的 SUPER_ADMINS）
- Project Hub 的账号**不会**自动带过来，要在 Contract & Service Hub 的 Users & access 另外加
- 使用手册：平台左下角 **Help** 直接打开 Project Hub 的手册（操作完全一样）

## 预设 Section（第一次登录按「Create the standard sections」自动建好）

| Section | 流程（Stage / Status） | 截止日期栏 |
|---|---|---|
| **Client Register** | Prospect → Active Client → Dormant / Inactive | Vendor registration expiry |
| **Contracts Register** | Under Negotiation → Awarded (LOA) → Active → Suspended / Renewal / Extension → Completed / Terminated | End / expiry date |
| **Service / Work Orders** | Received → Planning / Mobilising → In Progress → On Hold → Completed — to claim → Closed (claimed) / Cancelled | Target completion |
| **Variation Orders** | Identified → Preparing Quotation → Submitted to Client → Under Negotiation → Approved / Rejected / Withdrawn | Client response due |
| **Progress Claims & Payments** | Preparing → Submitted → Certified by Client → Invoiced → Partially Paid → Paid / Disputed | Payment due |
| **Bonds, Insurance & Licences** | Active → Renewal in Progress → Expired / Released | Expiry date |
| **Service Reports & SLA / KPI** | Pending → Submitted to Client → Action Required → Signed / Closed | Due to client |

- 关联：Contract 连到 Client；Work Order、VO、Claim、Bond、Report 都连到 Contract；VO / Claim / Report 还可以连到 Work Order
- 金额栏会自动加总（合同额、已 claim、VO 提交/批准额、Claim / Certified / Retention / Paid、Bond 金额）
- 卡太久会自动出现提醒标签（例如 Claim 在 Submitted 超过 7 天、VO 在 Submitted to Client 超过 14 天、Work Order 做完 5 天还没 claim）
- 栏位、阶段、提醒天数都能在线上 **Customize columns** 修改

## 上线步骤（Sam 做，约 5 分钟）

Google 登录的 Client ID **沿用 Project Hub 那个**（同一个网域 asana-sec.github.io），不用再去 Google Cloud 建。只要建一个新的后端：

1. 打开 <https://script.google.com/>（用 `sam.secov@gmail.com`）→ **New project**，项目名改成 `Contract Hub API`
2. 把 `apps-script/Code.gs` 的全部内容贴进 `Code.gs`
3. 左侧 Files 旁边按 **+ → Script**，命名为 `Core`，把 `assets/core.js` 的全部内容贴进去
4. 左侧 ⚙️ **Project Settings** → Time zone 选 `(GMT+08:00) Kuala Lumpur`
5. 回到 `Code.gs`，函数选单选 **setup** → **Run** → 授权（未验证的应用 → Advanced → Go to Contract Hub API）
   - 会新建 **Contract & Service Hub — Data**（Google Sheet）、**Contract & Service Hub — Files**（Drive 文件夹）和 **Contract & Service Hub** 日历
6. **Deploy → New deployment** → Web app，Execute as **Me**，Who has access **Anyone** → 复制 **Web app URL**（结尾 `/exec`）交给小助
7. 小助填进 `config.js` 推上线后，打开网址登录 → **Create the standard sections** → Users & access 加同事

> 以后 Code.gs 或 core.js 有更新，两个文件都要重新贴，再 **Deploy → Manage deployments → ✏️ → New version**，网址不变。

## 本机测试

```bash
py -3 -m http.server 8767
```

打开 `http://localhost:8767/?demo`：演示模式，示例账号包括 Hafiz（Contracts）、Mei Ling（PM）、Siti（Finance）、Daniel（Supervisor）、Raj（Technician，没有 Section 权限）。

## 跟 Project Hub / Procurement 的差别

| 项目 | Project Hub | Procurement | Contract & Service Hub |
|---|---|---|---|
| 网址 | `/project-hub/` | `/procurement/` | `/contract-hub/` |
| 后端 / Sheet / Drive / 日历 | Project Hub API | Procurement API | Contract Hub API（独立） |
| 浏览器存档键名 | `projecthub_*` | `procurement_*` | `contracthub_*`（同网域，互不干扰） |
| 主色 / 标志 | 蓝 / PH | 绿 / PR | 紫 / CS |
| 封存文件 | 三边格式相同，可以互相还原 | | |

## 文件结构

| 文件 | 用途 |
|---|---|
| `index.html` | 网页入口 |
| `config.js` | 设定（API 网址、Client ID、名称） |
| `assets/core.js` | 权限与数据规则：网页和后端共用（后端贴成 Core.gs） |
| `assets/templates.js` | 7 个合同 / 服务 Section 的预设模板 |
| `assets/app.js` | 全部画面和操作 |
| `assets/api.js` | 数据层（演示模式示例数据 / Google 后端） |
| `assets/archive.js` | 封存 / 备份 / 还原 |
| `assets/style.css` | 样式 |
| `apps-script/Code.gs` | Google 后端 |

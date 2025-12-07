## 快速上手 — 针对 AI 编码代理的项目要点（中文）

下面的要点帮助 AI 代理在本仓库中快速定位、修改并生成符合项目惯例的代码。

### 1) 项目概览（大局）
- 技术栈：Vue 3 + TypeScript + Vite（见 `package.json` 的 deps/devDeps）。
- 路由/状态：使用 `vue-router` 与 `pinia`（store 在 `src/store/index.ts`）。
- 接口层：分散在 `src/api/` 下（例如 `src/api/video.ts`、`src/api/user.ts` 等），所有 HTTP 调用通过 `src/utils/request.ts` 的封装进行。

### 2) 关键文件/目录（立即查看）
- `package.json` —— 构建/运行脚本（本仓库没有 `serve`，使用 Vite）：`dev`, `build`, `preview`。
- `vite.config.ts` —— Vite 配置与别名（影响导入路径）。
- `src/utils/request.ts` —— Axios 请求封装，所有 API 模块应复用此封装。
- `src/api/*.ts` —— 每个模块导出具体接口函数（按资源划分）。
- `src/types/` —— 项目共有类型定义（优先使用）。
- `src/router/index.ts`、`src/store/index.ts`、`src/views/`、`src/components/` —— 页面与组件的组织方式。

### 3) 常用开发命令（从 `package.json` 可确认）
建议使用 `pnpm`（本仓库含 `pnpm-lock.yaml`），若无 pnpm 可用 `npm`。

```powershell
# 安装依赖（首选 pnpm）
pnpm install
# 或者
npm install

# 本地开发（启动 Vite 开发服务器）
npm run dev
# 或
pnpm dev

# 构建（含类型检查）
npm run build

# 本地预览构建产物
npm run preview
```

注意：仓库没有 `npm run serve`（这是 Vue CLI 的命令）。如果看到类似错误 “Cannot find module ... @vue/cli-service”，说明错误地使用了 Vue CLI 的命令，正确命令如上。

### 4) 项目特有约定与可发现模式（写代码时遵循）
- API 调用统一通过 `src/utils/request.ts` 封装（不要直接在组件中 new Axios）。
- 新增 API：在 `src/api/` 建立模块文件（按资源名），导出函数，内部调用 `request` 封装并返回数据。
- 页面组件位于 `src/views/`，每个视图对应一条路由；可复用 UI 放 `src/components/`。
- 类型优先放 `src/types/` 并在模块中引用，避免随意在组件中写任意 `any`。
- SFC 推荐使用 `<script setup>`（项目模板为 Vue 3 + TS）。

示例：在 `src/api/video.ts` 新增接口函数时，应类似：
```ts
// src/api/video.ts
import request from '@/utils/request';
export const getVideoDetail = (id: string) => request.get(`/video/getone`, { params: { vid: id } });
```

### 5) 集成点 & 常见外部依赖
- HTTP：Axios（由 `src/utils/request.ts` 封装）。
- 打包/热重载：Vite（`vite`、`@vitejs/plugin-vue`）。
- 类型检查：`vue-tsc`（在 `build` 脚本中运行 `vue-tsc -b`）。
- 锁文件：`pnpm-lock.yaml`（推荐使用 pnpm 安装以一致依赖树）。

### 6) 故障排查提示（可直接生成到 PR 注释中）
- 错误：`Cannot find module ... @vue/cli-service` —— 原因：使用了 `npm run serve`（Vue CLI 专用），本仓库使用 Vite，请使用 `npm run dev`。
- 构建失败且与类型有关：运行 `npm run build` 可看到 `vue-tsc` 的类型检查输出。

### 7) 变更/PR 建议（对 AI 代理）
- 小改动：把实现拆为小的、可测、可审的提交；修改涉及接口时更新 `src/types/`。
- 大改动：先在 issue/PR 描述中列出预期改动点和受影响模块（`src/api`, `src/store`, `src/views`），并给出回滚或兼容方案。

---
如果需要，我可以把这里面某一节展开为更详细的编码规范或示例（例如：如何在 `src/utils/request.ts` 中加入统一的错误处理与重试）。请告诉我想优先完善的部分。

# 毛选蒸馏

抽签、典藏、问教员 — 基于 [maoxuan-skill](https://github.com/leezythu/maoxuan-skill) 与 [微信读书 Skills](https://github.com/Tencent/WeChatReading) 的个人网站。

## 功能

- **抽签**：从 MaoZeDongAnthology 随机抽取语录，签筒 SVG + 签条滑出动画
- **典藏**：毛选语录库搜索 + 微信读书全部读书笔记
- **问教员**：以毛选 SKILL.md 为 system prompt 的流式问答

## 前置条件

1. Node.js 18+
2. 克隆 MaoZeDongAnthology（已包含在 `vendor/` 或通过下方命令获取）
3. 微信读书 API Key：[weread-skills](https://weread.qq.com/r/weread-skills)
4. OpenAI 兼容 API Key（OpenAI / DeepSeek / 通义等）

## 快速开始

```bash
# 安装依赖
npm install

# 若 vendor/MaoZeDongAnthology 不存在
git clone --depth 1 https://github.com/weiyinfu/MaoZeDongAnthology.git vendor/MaoZeDongAnthology

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 WEREAD_API_KEY、OPENAI_API_KEY 等

# 构建语录索引
npm run build:quotes

# 开发（前端 :5173 + 后端 :3000）
npm run dev
```

浏览器打开 http://localhost:5173

## 生产部署

```bash
npm run build        # 构建语录索引 + 前端 + 后端
npm start            # 启动服务，默认 :3000
```

### 部署到 Render

适合需要公网链接、手机 4G/5G 访问、也能分享给别人。

1. 把仓库推到 GitHub
2. 登录 Render，新建 `Blueprint` 或 `Web Service`
3. 选择本仓库，Render 会读取根目录的 [render.yaml](./render.yaml)
4. 在 Render 后台补环境变量：
   - `WEREAD_API_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL=https://api.deepseek.com/v1`
   - `OPENAI_MODEL=deepseek-chat`
   - `SITE_TOKEN` 留空即可
5. 部署完成后，使用 Render 分配的 `https://*.onrender.com` 链接访问

说明：
- `free` 计划适合个人自用和轻量分享，但可能休眠，首次打开会慢一点
- 以后如果要固定自定义域名，再到 Render 里绑定域名即可

### 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `WEREAD_API_KEY` | 笔记功能 | 微信读书 API Key |
| `OPENAI_API_KEY` | 问答功能 | LLM API Key |
| `OPENAI_BASE_URL` | 否 | 默认 OpenAI，可改 DeepSeek 等 |
| `OPENAI_MODEL` | 否 | 默认 `gpt-4o-mini` |
| `SITE_TOKEN` | 推荐 | 访问令牌，分享给朋友 |
| `PORT` | 否 | 默认 3000 |
| `CORS_ORIGIN` | 否 | 生产环境建议设域名 |

### 部署到 VPS

1. 上传代码，`npm install && npm run build`
2. 配置 `.env`
3. 用 pm2 或 systemd 运行 `npm start`
4. Nginx 反代到 `127.0.0.1:3000`

## 项目结构

```
蒸馏/
├── client/          # React 前端
├── server/          # Hono API
├── skills/          # maoxuan-skill/SKILL.md
├── vendor/          # MaoZeDongAnthology
└── scripts/         # 语录索引构建
```

## 视觉风格

- 浅色宣纸底 `#F7F3EB` + 中国红 `#B91C1C` 点缀
- 底部 Tab 导航（抽签 / 典藏 / 问教员）
- 简化 SVG 线稿签筒 + 签条滑出动画

## 许可证

MIT — 毛选 skill 与 Anthology 请遵循各自仓库许可。

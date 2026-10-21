# likedtalking / Partner Within

手机模拟 + AI 陪伴聊天网站。

- 前端：GitHub Pages 静态站
- 后端：Cloudflare Worker
- AI：DeepSeek Chat Completions（`deepseek-flash`）
- 聊天记录：浏览器 localStorage
- 线上地址：https://fionna-fy.github.io/likedtalking-/

## 目录结构

```text
likedtalking-/
├── index.html
├── css/style.css
├── js/
│   ├── data.js
│   ├── app.js
│   ├── events.js
│   └── persona-engine.js
├── worker/index.js
├── .gitignore
├── .env.example
├── wrangler.toml
└── README.md
```

## 本地功能

- 锁屏 / 主屏幕 / WhatsApp 风格聊天
- 联系人角色设定、情绪、亲密度、记忆
- 随机动态事件与模拟来电
- AI 不可用时自动回退到本地 PersonaEngine

## Cloudflare Worker 配置

1. 在 Cloudflare 创建 Worker，名称建议：`likedtalking-ai`
2. 粘贴 `worker/index.js` 后 Deploy
3. Settings → Variables and Secrets 添加：

| Name | Type | Value |
|------|------|-------|
| `AI_API_KEY` | Secret | 你的 DeepSeek 密钥（sk- 开头） |
| `AI_API_URL` | Variable | `https://api.deepseek.com/chat/completions` |
| `AI_MODEL` | Variable | `deepseek-flash` |

4. 复制 Worker 地址，形如：

```text
https://likedtalking-ai.你的子域.workers.dev
```

5. 在 `js/app.js` 的 `getAiReply()` 中把 fetch 地址改成：

```text
https://likedtalking-ai.你的子域.workers.dev/api/chat
```

当前仓库已指向：`https://likedtalking-ai.lfy9291031.workers.dev/api/chat`

## 安全

- **不要**把真实 API Key 写进前端、GitHub 或 Worker 源码
- Key 只放在 Cloudflare Secret
- Worker 已限制 Origin 为 GitHub Pages

## 测试

1. 打开 https://fionna-fy.github.io/likedtalking-/
2. 解锁 → WhatsApp → 进入任意联系人
3. 发送「你好」
4. 应先出现「正在输入…」，再出现 AI 回复
5. 若 Worker / DeepSeek 失败，会自动使用本地角色回复

## 排查 HTTP 400 / 502

- `AI_API_URL` 必须完整为 `https://api.deepseek.com/chat/completions`
- `AI_MODEL` 必须为 `deepseek-flash`
- `AI_API_KEY` 必须是真实密钥
- 前端请求必须是 POST，且 body 含 `message`
- 在 Cloudflare Worker Logs 中查看真实错误

# Partner Within 完整项目

这是一个可以直接放进新 GitHub 仓库根目录的完整静态网站项目，包含手机模拟界面、WhatsApp 风格聊天、联系人角色设定、随机动态事件、浏览器本地存档和可选 AI 后端。

## 文件结构

- `index.html`：网站入口
- `css/style.css`：界面样式
- `js/data.js`：默认联系人与数据存储
- `js/app.js`：页面交互与聊天界面
- `js/events.js`：随机消息、通知和模拟来电
- `js/persona-engine.js`：角色化回复与 AI 接口设置
- `worker/index.js`：可选 Cloudflare Worker 后端
- `README-UPGRADE.md`：详细升级说明

## 部署到新仓库

1. 解压 ZIP。
2. 打开你新建的 GitHub 仓库，进入 `Add file` → `Upload files`。
3. 把解压后文件夹里的**所有文件和文件夹内容**上传到仓库根目录。不要只上传 ZIP。
4. 点 `Commit changes` 保存。
5. 打开仓库 `Settings` → `Pages`，选择 `Deploy from a branch`、`main`、`/(root)` 并保存。
6. 等待部署完成后打开 GitHub Pages 地址。

## 角色设定

- 李灿荣 Anton：虚构互动角色；事业有成的企业高管、游泳实力出众、比用户大四岁；与用户互有好感，慢热、内敛、有主见。
- Eamoon：保留原有背景设定，包括通过抖音认识、一起玩《光·遇》、喜欢剪辑、生活在堪培拉、家里做生意；比用户大四岁，温柔但有一点毒舌。
- Mia：用户高中同学；抽象搞笑、脑回路清奇，但本质善良，能认真倾听。
- 其他原型联系人保留并可在设置中修改。

## 聊天能力说明

- 本地模式：不需要 API 密钥或付费，但采用规则式角色回复，表达能力有限。
- AI 模式：需要部署 `worker/index.js` 并在后端配置 `AI_API_KEY` 等 Secret。不要把 API Key 写进网页文件或上传到 GitHub。
- 网页聊天没有人为设置的固定条数限制，但浏览器存储空间和模型服务的上下文/调用限制仍然适用。
- 角色聊天数据默认保存在当前浏览器的 `localStorage`，不会自动跨设备同步。

## 旧数据提示

如果之前在同一个浏览器打开过旧版网站，浏览器可能继续使用旧存档，因此新默认角色不一定自动显示。先在配置中心点“导出配置”备份；需要载入新默认数据时，可在该网站浏览器控制台执行 `localStorage.removeItem("phoneSimData"); localStorage.removeItem("partnerWithinAI"); location.reload();`。这会清除本地角色和聊天存档，请确认已备份后再操作。


# Partner Within 升级与部署说明

## 一、项目文件结构

```text
index.html
README.md
README-UPGRADE.md
css/
  style.css
js/
  data.js
  app.js
  events.js
  persona-engine.js
worker/
  index.js
```

## 二、GitHub Pages 部署

1. 将前端文件放在仓库根目录和对应子目录。
2. 确认 `index.html` 位于仓库根目录。
3. 打开仓库 Settings。
4. 进入 Pages。
5. 在 Build and deployment 中选择 Deploy from a branch。
6. 选择 `main` 分支和 `/ (root)` 目录。
7. 保存设置，等待 GitHub Pages 构建完成。
8. 打开 Pages 页面显示的网站地址进行测试。

## 三、功能说明

- `index.html`：网页结构与界面元素。
- `css/style.css`：页面样式和手机模拟外观。
- `js/data.js`：联系人、角色设定和默认聊天数据。
- `js/app.js`：桌面、应用切换和聊天交互。
- `js/events.js`：模拟通知、随机消息和来电。
- `js/persona-engine.js`：角色回复逻辑和可选 AI 接口调用。
- `worker/index.js`：可选的 AI 后端服务示例。

## 四、AI 后端注意事项

GitHub Pages 只能托管静态前端文件，不能直接运行 Cloudflare Worker。

如需启用 AI 对话，需要将 `worker/index.js` 部署到相应的 Worker 服务，并配置服务端 API 密钥。不要将 API 密钥放进 `index.html` 或任何公开的 JavaScript 文件。

前端 AI 接口地址必须与后端部署地址一致。若未部署后端，可先使用本地角色回复功能。

## 五、数据保存

当前示例将聊天数据保存在浏览器的 localStorage 中。

- 数据通常只在当前浏览器和当前网站来源下可用。
- 清除网站数据可能导致聊天记录丢失。
- 更换设备或浏览器时，不会自动同步。
- 如需保留数据，请使用项目提供的导出功能（如果当前页面已接入）。

## 六、测试顺序

1. 打开网页，检查锁屏和桌面是否显示。
2. 进入 WhatsApp，检查联系人列表。
3. 打开聊天，发送一条消息。
4. 检查角色回复、返回按钮和设置面板。
5. 检查随机事件功能。
6. 若部署了后端，再测试 AI 接口。

如果页面空白，请先检查浏览器控制台中的 JavaScript 报错，并确认所有文件路径与 `index.html` 中的引用一致。


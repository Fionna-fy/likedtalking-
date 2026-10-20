const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

let currentView = "lock";
let currentApp = null;
let currentChatId = null;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function bindIfExists(selector, eventName, handler) {
  const element = $(selector);
  if (element) element.addEventListener(eventName, handler);
  return element;
}

function updateClock() {
  const d = new Date();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const lockTimeEl = $("#lockTime");
  const homeTimeEl = $("#homeTime");
  const lockDateEl = $("#lockDate");

  if (lockTimeEl) lockTimeEl.textContent = ((h % 12) || 12) + ":" + m;
  if (homeTimeEl) homeTimeEl.textContent = String(h).padStart(2, "0") + ":" + m;
  if (lockDateEl) lockDateEl.textContent = `${d.getMonth() + 1}月${d.getDate()}日周${"日一二三四五六"[d.getDay()]}`;
}

setInterval(updateClock, 10000);
updateClock();

bindIfExists("#lockScreen", "click", unlock);
bindIfExists("#lockScreen", "touchend", unlock);

function unlock() {
  if (currentView !== "lock") return;
  $("#lockScreen")?.classList.remove("active");
  $("#homeScreen")?.classList.add("active");
  currentView = "home";
  renderHome();
  startEventLoop();
}

function renderHome() {
  const grid = $("#appGrid");
  if (!grid) return;

  grid.innerHTML = "";
  const folders = [
    ["Safari", ["🧭", "🔍", "⭐", "📑"]],
    ["Editing", ["✂️", "🎬", "🖼️", "🎨"]],
    ["Shopping", ["🛒", "📦", "💳", "🏷️"]],
    ["QQ", ["🐧"]],
    ["Game", ["🎮", "🕹️", "🏆", "👾"]],
    ["Study", ["📖", "✏️", "🧮", "🎓"]],
    ["Trip", ["✈️", "🚇", "🗺️", "🏨"]],
    ["Economic", ["💰", "📊", "🏦", "📈"]]
  ];

  folders.forEach(([name, icons]) => {
    const el = document.createElement("div");
    el.className = "folder";
    el.innerHTML = `<div class="folder-inner">${icons.map((x) => `<span>${x}</span>`).join("")}</div><div class="folder-name">${escapeHTML(name)}</div>`;
    el.onclick = () => openApp("folder", name);
    grid.appendChild(el);
  });

  const wa = document.createElement("div");
  wa.className = "app-icon";
  const unread = (appData?.contacts || []).reduce((sum, contact) => sum + (Number(contact.unread) || 0), 0);
  wa.innerHTML = `<div class="app-icon-inner" style="background:linear-gradient(135deg,#25d366,#128c7e)">💬${unread ? `<span class="badge">${unread}</span>` : ""}</div><div class="app-name">WhatsApp</div>`;
  wa.onclick = () => openApp("whatsapp");
  grid.appendChild(wa);

  const widget = document.createElement("div");
  widget.className = "widget-large";
  widget.innerHTML = `<div style="font-size:13px;color:#666">Partner Within</div><div style="font-size:24px">一些重要的人，和一些日常</div><div style="font-size:12px;color:#888">聊天记录、事件与角色设置都保存在当前浏览器中</div>`;
  grid.appendChild(widget);

  updateBadges();
}

function updateBadges() {
  const total = (appData?.contacts || []).reduce((sum, contact) => sum + (Number(contact.unread) || 0), 0);
  const badge = $("#msgBadge");
  if (badge) {
    badge.textContent = total || "";
    badge.style.display = total ? "flex" : "none";
  }
}

function openApp(type, extra) {
  currentApp = type;
  $("#homeScreen")?.classList.remove("active");
  $("#appScreen")?.classList.add("active");
  currentView = "app";
  currentChatId = null;

  const appTitle = $("#appTitle");
  if (appTitle) {
    appTitle.textContent = type === "whatsapp" ? "WhatsApp" : type === "folder" ? extra : type === "wechat" ? "微信（演示）" : type;
  }

  if (type === "whatsapp") {
    renderWhatsAppList($("#appContent"));
    return;
  }

  const content = $("#appContent");
  if (content) {
    content.innerHTML = `<div style="padding:35px;text-align:center;color:#666">${type === "folder" ? `文件夹「${escapeHTML(extra || "") }」` : "这个应用暂时是展示界面"}</div>`;
  }
}

function renderWhatsAppList(container) {
  if (!container) return;
  let html = `<div class="wa-header"><span style="font-size:20px">WhatsApp</span><span style="margin-left:auto;font-size:12px">聊天</span></div><div class="wa-list">`;

  (appData?.contacts || []).forEach((contact) => {
    const last = escapeHTML(contact.lastMessage || "新对话");
    const time = escapeHTML(contact.lastTime || "");
    const badge = Number(contact.unread) > 0 ? `<span class="wa-unread">${Number(contact.unread)}</span>` : "";
    html += `<div class="wa-chat-item" data-id="${escapeHTML(contact.id)}"><div class="wa-avatar">${escapeHTML(contact.avatar || "👤")}</div><div class="wa-info"><div class="wa-name">${escapeHTML(contact.name)}</div><div class="wa-last"><span>${last}</span><small>${time}</small></div></div>${badge}</div>`;
  });

  container.innerHTML = html + "</div>";
  $$(".wa-chat-item").forEach((el) => {
    el.onclick = () => openChat(el.dataset.id);
  });
}

function openChat(id) {
  currentChatId = id;
  const contact = (appData?.contacts || []).find((entry) => entry.id === id);
  if (!contact) return;

  contact.unread = 0;
  saveData(appData);
  updateBadges();

  let html = `<div class="chat-view"><div class="wa-header"><button id="chatBack">‹</button><span>${escapeHTML(contact.avatar || "👤")} ${escapeHTML(contact.name)}</span><span style="margin-left:auto;font-size:12px;font-weight:500">${escapeHTML(contact.relation || "")}</span></div><div id="chatMessages" class="chat-messages">`;

  (contact.messages || []).forEach((message) => {
    html += `<div class="bubble ${message.from === "me" ? "me" : "them"}">${escapeHTML(message.text)}<div class="time">${escapeHTML(message.time || "")}</div></div>`;
  });

  html += `</div><div class="chat-input-bar"><input id="chatInput" type="text" placeholder="输入消息..." autocomplete="off"/><button id="sendBtn">➤</button></div></div>`;
  const content = $("#appContent");
  if (content) content.innerHTML = html;

  $("#chatBack")?.addEventListener("click", () => {
    currentChatId = null;
    renderWhatsAppList($("#appContent"));
  });

  $("#sendBtn")?.addEventListener("click", () => sendMessage());
  $("#chatInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendMessage();
  });

  const messagesContainer = $("#chatMessages");
  if (messagesContainer) {
    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }
}

function sendMessage() {
  const input = $("#chatInput");
  const text = input?.value.trim();
  if (!text || !currentChatId) return;

  const contact = (appData?.contacts || []).find((entry) => entry.id === currentChatId);
  if (!contact) return;

  contact.messages = Array.isArray(contact.messages) ? contact.messages : [];
  contact.messages.push({ from: "me", text, time: getCurrentTimeStr() });
  contact.lastMessage = text;
  contact.lastTime = "刚刚";
  appData = saveData(appData);
  openChat(contact.id);

  setTimeout(() => {
    if (typeof window.sendMessage === "function" && window.sendMessage !== sendMessage) {
      return;
    }

    if (!window.PersonaEngine || typeof window.PersonaEngine.localReply !== "function") {
      const fallback = "我在听，你继续说。";
      contact.messages.push({ from: "them", text: fallback, time: getCurrentTimeStr() });
      contact.lastMessage = fallback;
      contact.lastTime = "刚刚";
      appData = saveData(appData);
      if (currentChatId === contact.id) openChat(contact.id);
      else {
        contact.unread = (Number(contact.unread) || 0) + 1;
        updateBadges();
        showToast(contact.name + ": " + fallback);
      }
      return;
    }

    const reply = window.PersonaEngine.localReply(contact, text);
    contact.messages.push({ from: "them", text: reply, time: getCurrentTimeStr() });
    contact.lastMessage = reply;
    contact.lastTime = "刚刚";
    appData = saveData(appData);

    if (currentChatId === contact.id) openChat(contact.id);
    else {
      contact.unread = (Number(contact.unread) || 0) + 1;
      updateBadges();
      showToast(contact.name + ": " + reply);
    }
  }, 500);
}

bindIfExists("#backBtn", "click", () => {
  if (currentChatId) {
    currentChatId = null;
    renderWhatsAppList($("#appContent"));
    return;
  }

  $("#appScreen")?.classList.remove("active");
  $("#homeScreen")?.classList.add("active");
  currentView = "home";
  currentApp = null;
  renderHome();
});

bindIfExists("#configBtn", "click", openConfig);
bindIfExists("#closeConfig", "click", closeConfig);

function openConfig() {
  const overlay = $("#configOverlay");
  const inputName = $("#cfgOwnerName");
  const selectWallpaper = $("#cfgWallpaper");
  const checkboxEvents = $("#cfgEvents");
  const selectEventFreq = $("#cfgEventFreq");

  if (overlay) overlay.classList.remove("hidden");
  if (inputName) inputName.value = appData.owner.name || "Fionna";
  if (selectWallpaper) selectWallpaper.value = appData.owner.wallpaper || "purple";
  if (checkboxEvents) checkboxEvents.checked = appData.eventsEnabled !== false;
  if (selectEventFreq) selectEventFreq.value = appData.eventFreq || "medium";

  const list = $("#contactList");
  if (!list) return;
  list.innerHTML = "";

  (appData?.contacts || []).forEach((contact) => {
    const row = document.createElement("div");
    row.className = "contact-row";
    row.innerHTML = `<span>${escapeHTML(contact.avatar || "👤")} ${escapeHTML(contact.name)} <small>(${escapeHTML(contact.relation || "")})</small></span><button class="del-contact" data-id="${escapeHTML(contact.id)}">删除</button>`;
    list.appendChild(row);
  });

  $$(".del-contact").forEach((button) => {
    button.onclick = () => {
      appData.contacts = (appData.contacts || []).filter((contact) => contact.id !== button.dataset.id);
      appData = saveData(appData);
      openConfig();
    };
  });
}

function closeConfig() {
  appData.owner.name = $("#cfgOwnerName")?.value || "Fionna";
  appData.owner.wallpaper = $("#cfgWallpaper")?.value || "purple";
  appData.eventsEnabled = $("#cfgEvents")?.checked !== false;
  appData.eventFreq = $("#cfgEventFreq")?.value || "medium";
  appData = saveData(appData);
  applyWallpaper();
  startEventLoop();
  $("#configOverlay")?.classList.add("hidden");
  if (currentView === "home") renderHome();
  else if (currentApp === "whatsapp") renderWhatsAppList($("#appContent"));
}

function applyWallpaper() {
  const homeScreen = $("#homeScreen");
  if (!homeScreen) return;
  homeScreen.style.background = appData.owner.wallpaper === "purple"
    ? "linear-gradient(155deg,#d8c0ed,#8175bd 48%,#33254e)"
    : "linear-gradient(145deg,#f3eee9,#d9d3d0)";
}

bindIfExists("#addContactBtn", "click", () => {
  const name = prompt("联系人名字：");
  if (!name || !name.trim()) return;
  const safeName = sanitizeText(name, "联系人", 80);
  appData.contacts.push({
    id: "c" + Date.now(),
    name: safeName,
    avatar: "👤",
    relation: "自定义",
    personality: "自然、真诚，有自己的想法。",
    emotion: "自然",
    relationshipScore: 20,
    memories: [],
    lastMessage: "新对话",
    lastTime: "刚刚",
    unread: 0,
    messages: [{ from: "them", text: "嗨，终于聊上了。", time: getCurrentTimeStr() }]
  });
  appData = saveData(appData);
  openConfig();
});

bindIfExists("#exportBtn", "click", () => {
  const blob = new Blob([JSON.stringify(appData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "partnerwithin-data.json";
  link.click();
  URL.revokeObjectURL(url);
});

bindIfExists("#importBtn", "click", () => $("#importFile")?.click());

bindIfExists("#importFile", "change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    try {
      const parsed = JSON.parse(String(loadEvent.target?.result || "{}"));
      appData = normalizeData(parsed);
      appData = saveData(appData);
      alert("导入成功");
      openConfig();
    } catch (error) {
      alert("导入失败：JSON 格式不正确");
    }
  };
  reader.readAsText(file);
});

bindIfExists("#resetBtn", "click", () => {
  if (confirm("确定重置？重置前请先导出备份。")) {
    try {
      localStorage.removeItem("phoneSimData");
    } catch (error) {
      console.warn("Reset failed", error);
    }
    location.reload();
  }
});

$$(".dock-app").forEach((element) => {
  element.onclick = () => openApp(element.dataset.app === "messages" ? "whatsapp" : element.dataset.app);
});

applyWallpaper();

window.escapeHTML = escapeHTML;
window.currentView = () => currentView;
window.currentChatId = () => currentChatId;
window.appData = appData;

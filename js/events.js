let eventTimer = null;
let timeOffset = 0;

function getCurrentTimeStr() {
  const d = new Date(Date.now() + timeOffset * 1000);
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function startEventLoop() {
  if (eventTimer) clearInterval(eventTimer);
  if (!appData || !appData.eventsEnabled) return;
  const ms = { low: 60000, medium: 35000, high: 18000 }[appData.eventFreq] || 35000;
  eventTimer = setInterval(() => {
    if (Math.random() < 0.45) triggerRandomEvent();
  }, ms);
}

function triggerRandomEvent() {
  const list = Array.isArray(appData?.eventTemplates) ? appData.eventTemplates : [];
  const contacts = Array.isArray(appData?.contacts) ? appData.contacts : [];
  if (!list.length || !contacts.length) return;
  const template = list[Math.floor(Math.random() * list.length)];
  const contact = (template && template.contactId && contacts.find((x) => x.id === template.contactId)) || contacts[Math.floor(Math.random() * contacts.length)];
  if (!contact) return;

  if (template.type === "call") {
    showIncomingCall(contact);
    return;
  }

  if (template.type === "notification") {
    showToast((template.title || "提醒") + ": " + (template.body || "你有一条新提醒"));
    return;
  }

  const msg = (template.text || "刚刚想到你了.").slice(0, 240);
  const aiMessage = { from: "them", text: msg, time: getCurrentTimeStr() };
  contact.messages = Array.isArray(contact.messages) ? contact.messages : [];
  contact.messages.push(aiMessage);
  contact.lastMessage = msg;
  contact.lastTime = "刚刚";

  // 用户正在该聊天页时直接追加气泡，否则增加未读
  if (typeof currentChatId !== "undefined" && currentChatId === contact.id && typeof appendChatMessage === "function") {
    appendChatMessage(contact, aiMessage);
  } else {
    contact.unread = (Number(contact.unread) || 0) + 1;
    showToast(contact.name + ": " + msg);
  }

  appData = saveData(appData);
  if (typeof updateBadges === "function") updateBadges();
}

function showToast(msg) {
  const screen = document.getElementById("screen");
  if (!screen) return;
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.classList.add("hidden");
    screen.appendChild(el);
  }
  el.textContent = String(msg || "");
  el.classList.remove("hidden");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add("hidden"), 2800);
}

function showIncomingCall(contact) {
  const overlay = $("#callOverlay");
  if (!overlay || !contact) return;
  $("#callName").textContent = contact.name || "未知";
  overlay.classList.remove("hidden");
  const timer = setTimeout(declineCall, 15000);

  $("#declineCall").onclick = () => {
    clearTimeout(timer);
    declineCall();
  };

  $("#acceptCall").onclick = () => {
    clearTimeout(timer);
    overlay.classList.add("hidden");
    showToast("与 " + contact.name + " 通话中（模拟）");
  };
}

function declineCall() {
  const overlay = $("#callOverlay");
  if (overlay) overlay.classList.add("hidden");
  showToast("已拒绝来电");
}

window.startEventLoop = startEventLoop;
window.triggerRandomEvent = triggerRandomEvent;
window.showIncomingCall = showIncomingCall;
window.showToast = showToast;

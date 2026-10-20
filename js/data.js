const DEFAULT_DATA = {
  owner: { name: "Fionna", wallpaper: "purple" },
  contacts: [
    {
      id: "anton",
      name: "李灿荣 Anton",
      avatar: "🏊🏻‍♂️",
      relation: "互有好感 / 暧昧发展中 / 比你大四岁",
      personality: "虚构角色；参考清爽、安静、略带独特感的公子气。喜欢认真听你说话，偶尔会用一点幽默拉住场面。",
      emotion: "自然",
      relationshipScore: 78,
      memories: [],
      lastMessage: "最近有点想和你聊聊",
      lastTime: "刚刚",
      unread: 0,
      messages: [
        { from: "them", text: "你今天还在忙吗？", time: "21:14" }
      ]
    },
    {
      id: "eamoon",
      name: "Eamoon",
      avatar: "🌙",
      relation: "熟悉的朋友 / 比你大四岁",
      personality: "保留原背景：通过抖音认识，一起玩《光·遇》，喜欢剪辑视频，生活在堪培拉，家里做生意。",
      emotion: "自然",
      relationshipScore: 68,
      memories: [],
      lastMessage: "剪辑素材我又看到一条有点适合你",
      lastTime: "1小时前",
      unread: 1,
      messages: [
        { from: "them", text: "我又找到一条很适合你口味的素材。", time: "20:42" }
      ]
    },
    {
      id: "mia",
      name: "Mia",
      avatar: "🌸",
      relation: "高中同学 / 老朋友",
      personality: "用户的高中同学。抽象有趣、脑回路清奇、接梗很快，讲话生动，有时一本正经地说离谱的话。",
      emotion: "开心",
      relationshipScore: 60,
      memories: [],
      lastMessage: "我有个新梗，等我给你讲完你就懂了",
      lastTime: "今天",
      unread: 0,
      messages: [
        { from: "them", text: "我有个新梗，等我给你讲完你就懂了。", time: "15:10" }
      ]
    },
    {
      id: "alex",
      name: "Alex",
      avatar: "🧑‍💻",
      relation: "大学同学 / 项目搭档",
      personality: "理性、偶尔吐槽、靠谱，喜欢把问题拆开分析，关心朋友但不煽情。",
      emotion: "自然",
      relationshipScore: 52,
      memories: [],
      lastMessage: "你这周的进展怎么样？",
      lastTime: "昨天",
      unread: 0,
      messages: [
        { from: "them", text: "你这周的进展怎么样？", time: "昨天" }
      ]
    },
    {
      id: "mom",
      name: "Mom",
      avatar: "👩",
      relation: "家人",
      personality: "关心、碎碎念，习惯提醒用户吃饭、休息和注意天气。",
      emotion: "关心",
      relationshipScore: 90,
      memories: [],
      lastMessage: "外面天气变了，记得穿好一点。",
      lastTime: "今天",
      unread: 0,
      messages: [
        { from: "them", text: "外面天气变了，记得穿好一点。", time: "今天" }
      ]
    }
  ],
  eventsEnabled: true,
  eventFreq: "medium",
  eventTemplates: [
    { type: "message", contactId: "anton", text: "刚忙完，想问问你今天怎么样。" },
    { type: "message", contactId: "eamoon", text: "看到一个剪辑素材，感觉你会喜欢。" },
    { type: "message", contactId: "mia", text: "我刚想到一个特别适合你的梗。" },
    { type: "notification", title: "提醒", body: "你有一条新的消息" },
    { type: "call", contactId: "anton" }
  ]
};

function sanitizeText(value, fallback = "", maxLength = 250) {
  if (value === null || value === undefined) return fallback;
  const out = String(value).replace(/\s+/g, " ").trim();
  return out.length > maxLength ? out.slice(0, maxLength) : out;
}

function normalizeMessage(message) {
  if (!message || typeof message !== "object") return null;
  const text = sanitizeText(message.text, "", 400);
  const from = message.from === "me" ? "me" : "them";
  if (!text) return null;
  return {
    from,
    text,
    time: sanitizeText(message.time, new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }), 20)
  };
}

function normalizeContact(contact) {
  const raw = contact && typeof contact === "object" ? contact : {};
  const messages = Array.isArray(raw.messages) ? raw.messages.map(normalizeMessage).filter(Boolean) : [];
  return {
    id: sanitizeText(raw.id, `c${Date.now()}${Math.random().toString(36).slice(2, 6)}`, 64),
    name: sanitizeText(raw.name, "联系人", 80),
    avatar: sanitizeText(raw.avatar, "👤", 8),
    relation: sanitizeText(raw.relation, "熟人", 120),
    personality: sanitizeText(raw.personality, "自然、真诚，有自己的想法。", 200),
    emotion: sanitizeText(raw.emotion, "自然", 40),
    relationshipScore: Number.isFinite(Number(raw.relationshipScore)) ? Math.max(0, Math.min(100, Number(raw.relationshipScore))) : 25,
    memories: Array.isArray(raw.memories) ? raw.memories.map(x => sanitizeText(x, "", 200)).filter(Boolean).slice(-30) : [],
    lastMessage: sanitizeText(raw.lastMessage, messages.at(-1)?.text || "新对话", 200),
    lastTime: sanitizeText(raw.lastTime, "刚刚", 20),
    unread: Number.isFinite(Number(raw.unread)) ? Math.max(0, Number(raw.unread)) : 0,
    messages
  };
}

function normalizeData(rawData) {
  const source = rawData && typeof rawData === "object" ? rawData : {};
  const owner = source.owner && typeof source.owner === "object" ? source.owner : {};
  const contacts = Array.isArray(source.contacts) && source.contacts.length ? source.contacts.map(normalizeContact) : DEFAULT_DATA.contacts.map(normalizeContact);

  return {
    owner: {
      name: sanitizeText(owner.name, DEFAULT_DATA.owner.name, 80),
      wallpaper: owner.wallpaper === "purple" || owner.wallpaper === "warm" ? owner.wallpaper : DEFAULT_DATA.owner.wallpaper
    },
    contacts,
    eventsEnabled: source.eventsEnabled !== false,
    eventFreq: ["low", "medium", "high"].includes(source.eventFreq) ? source.eventFreq : DEFAULT_DATA.eventFreq,
    eventTemplates: Array.isArray(source.eventTemplates) && source.eventTemplates.length
      ? source.eventTemplates
          .filter((item) => item && typeof item === "object")
          .map((item) => ({
            type: item.type === "call" || item.type === "notification" || item.type === "message" ? item.type : "message",
            contactId: sanitizeText(item.contactId, "", 64),
            title: sanitizeText(item.title, "提醒", 80),
            body: sanitizeText(item.body, "你有一条新提醒", 200),
            text: sanitizeText(item.text, "刚刚想到你了。", 240)
          }))
          .slice(0, 50)
      : DEFAULT_DATA.eventTemplates
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem("phoneSimData");
    if (!raw) return normalizeData(DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    return normalizeData(parsed);
  } catch (error) {
    console.warn("Invalid saved data, reset to default.", error);
    try {
      localStorage.removeItem("phoneSimData");
    } catch (cleanupError) {
      console.warn("Could not clear localStorage", cleanupError);
    }
    return normalizeData(DEFAULT_DATA);
  }
}

function saveData(data) {
  try {
    const normalized = normalizeData(data || DEFAULT_DATA);
    localStorage.setItem("phoneSimData", JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.warn("Could not save app data", error);
    return normalizeData(DEFAULT_DATA);
  }
}

let appData = loadData();

window.DEFAULT_DATA = DEFAULT_DATA;
window.loadData = loadData;
window.saveData = saveData;
window.normalizeData = normalizeData;

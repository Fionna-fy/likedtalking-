
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
let currentView="lock",currentApp=null,currentChatId=null;

function updateClock(){
 const d=new Date(),h=d.getHours(),m=String(d.getMinutes()).padStart(2,"0");
 $("#lockTime").textContent=((h%12)||12)+":"+m;
 $("#homeTime").textContent=String(h).padStart(2,"0")+":"+m;
 $("#lockDate").textContent=`${d.getMonth()+1}月${d.getDate()}日周${"日一二三四五六"[d.getDay()]}`;
}
setInterval(updateClock,10000);
updateClock();

$("#lockScreen").addEventListener("click",unlock);
$("#lockScreen").addEventListener("touchend",unlock);

function unlock(){
 if(currentView!=="lock")return;
 $("#lockScreen").classList.remove("active");
 $("#homeScreen").classList.add("active");
 currentView="home";
 renderHome();
 startEventLoop();
}

function renderHome(){
 const grid=$("#appGrid");
 grid.innerHTML="";
 const folders=[
  ["Safari",["🧭","🔍","⭐","📑"]],
  ["Editing",["✂️","🎬","🖼️","🎨"]],
  ["Shopping",["🛒","📦","💳","🏷️"]],
  ["QQ",["🐧"]],
  ["Game",["🎮","🕹️","🏆","👾"]],
  ["Study",["📖","✏️","🧮","🎓"]],
  ["Trip",["✈️","🚇","🗺️","🏨"]],
  ["Economic",["💰","📊","🏦","📈"]]
 ];

 folders.forEach(([name,icons])=>{
  const el=document.createElement("div");
  el.className="folder";
  el.innerHTML=`<div class="folder-inner">${icons.map(x=>`<span>${x}</span>`).join("")}</div><div class="folder-name">${name}</div>`;
  el.onclick=()=>openApp("folder",name);
  grid.appendChild(el);
 });

 const wa=document.createElement("div");
 wa.className="app-icon";
 const unread=appData.contacts.reduce((n,c)=>n+(c.unread||0),0);
 wa.innerHTML=`<div class="app-icon-inner" style="background:linear-gradient(135deg,#25d366,#128c7e)">💬${unread?`<span class="badge">${unread}</span>`:""}</div><div class="app-name">WhatsApp</div>`;
 wa.onclick=()=>openApp("whatsapp");
 grid.appendChild(wa);

 const widget=document.createElement("div");
 widget.className="widget-large";
 widget.innerHTML=`<div style="font-size:13px;color:#666">Partner Within</div><div style="font-size:24px">一些重要的人，和一些日常</div><div style="font-size:12px;color:#888">聊天记录保存在当前浏览器</div>`;
 grid.appendChild(widget);
 updateBadges();
}

function updateBadges(){
 const n=appData.contacts.reduce((s,c)=>s+(c.unread||0),0),b=$("#msgBadge");
 if(b){b.textContent=n||"";b.style.display=n?"flex":"none";}
}

function openApp(type,extra){
 currentApp=type;
 $("#homeScreen").classList.remove("active");
 $("#appScreen").classList.add("active");
 currentView="app";
 currentChatId=null;
 $("#appTitle").textContent=type==="whatsapp"?"WhatsApp":type==="folder"?extra:type==="wechat"?"微信（演示）":type;
 if(type==="whatsapp")renderWhatsAppList($("#appContent"));
 else $("#appContent").innerHTML=`<div style="padding:35px;text-align:center;color:#666">${type==="folder"?"文件夹「"+extra+"」":"这个应用暂时是展示界面"}</div>`;
}

function renderWhatsAppList(container){
 let html=`<div class="wa-header"><span style="font-size:20px">WhatsApp</span><span style="margin-left:auto;font-size:12px">聊天</span></div><div class="wa-list">`;
 appData.contacts.forEach(c=>{
  html+=`<div class="wa-chat-item" data-id="${c.id}"><div class="wa-avatar">${c.avatar||"👤"}</div><div class="wa-info"><div class="wa-name">${escapeHTML(c.name)}</div><div class="wa-last">${escapeHTML(c.lastMessage||"")}</div></div><div class="wa-meta"><div>${c.lastTime||""}</div>${c.unread?`<div class="wa-unread">${c.unread}</div>`:""}</div></div>`;
 });
 container.innerHTML=html+"</div>";
 $$(".wa-chat-item").forEach(e=>e.onclick=()=>openChat(e.dataset.id));
}

function openChat(id){
 currentChatId=id;
 const c=appData.contacts.find(x=>x.id===id);
 if(!c)return;
 c.unread=0;
 saveData(appData);
 updateBadges();

 let html=`<div class="chat-view"><div class="wa-header"><button id="chatBack">‹</button><span>${c.avatar||"👤"} ${escapeHTML(c.name)}</span><span style="margin-left:auto;font-size:12px;font-weight:400">${escapeHTML(c.emotion||"")}</span></div><div class="chat-messages" id="chatMessages">`;

 (c.messages||[]).forEach(m=>{
  html+=`<div class="bubble ${m.from==="me"?"me":"them"}">${escapeHTML(m.text)}<div class="time">${m.time||""}</div></div>`;
 });

 html+=`</div><div class="chat-input-bar"><input id="chatInput" type="text" placeholder="输入消息..." autocomplete="off"/><button id="sendBtn">➤</button></div></div>`;
 $("#appContent").innerHTML=html;

 $("#chatBack").onclick=()=>{
  currentChatId=null;
  renderWhatsAppList($("#appContent"));
 };
 $("#sendBtn").onclick=()=>window.sendMessage();
 $("#chatInput").onkeydown=e=>{if(e.key==="Enter")window.sendMessage();};

 const msgs=$("#chatMessages");
 msgs.scrollTop=msgs.scrollHeight;
}

function sendMessage(){
 const input=$("#chatInput"),text=input?.value.trim();
 if(!text||!currentChatId)return;
 const c=appData.contacts.find(x=>x.id===currentChatId);
 if(!c)return;

 c.messages.push({from:"me",text,time:getCurrentTimeStr()});
 c.lastMessage=text;
 c.lastTime="刚刚";
 saveData(appData);
 openChat(c.id);

 setTimeout(()=>{
  if(window.sendMessage===sendMessage){
   const reply=PersonaEngine.localReply(c,text);
   c.messages.push({from:"them",text:reply,time:getCurrentTimeStr()});
   c.lastMessage=reply;
   c.lastTime="刚刚";
   saveData(appData);
   if(currentChatId===c.id)openChat(c.id);
   else{
    c.unread=(c.unread||0)+1;
    updateBadges();
    showToast(c.name+": "+reply);
   }
  }
 },500);
}

$("#backBtn").onclick=()=>{
 if(currentChatId){
  currentChatId=null;
  renderWhatsAppList($("#appContent"));
  return;
 }
 $("#appScreen").classList.remove("active");
 $("#homeScreen").classList.add("active");
 currentView="home";
 currentApp=null;
 renderHome();
};

$("#configBtn").onclick=openConfig;
$("#closeConfig").onclick=closeConfig;

function openConfig(){
 $("#configOverlay").classList.remove("hidden");
 $("#cfgOwnerName").value=appData.owner.name||"Fionna";
 $("#cfgWallpaper").value=appData.owner.wallpaper||"purple";
 $("#cfgEvents").checked=appData.eventsEnabled!==false;
 $("#cfgEventFreq").value=appData.eventFreq||"medium";

 const list=$("#contactList");
 list.innerHTML="";
 appData.contacts.forEach(c=>{
  const row=document.createElement("div");
  row.className="contact-row";
  row.innerHTML=`<span>${c.avatar||"👤"} ${escapeHTML(c.name)} <small>(${escapeHTML(c.relation||"")})</small></span><button class="del-contact" data-id="${c.id}">删除</button>`;
  list.appendChild(row);
 });

 $$(".del-contact").forEach(b=>b.onclick=()=>{
  appData.contacts=appData.contacts.filter(c=>c.id!==b.dataset.id);
  saveData(appData);
  openConfig();
 });
}

function closeConfig(){
 appData.owner.name=$("#cfgOwnerName").value||"Fionna";
 appData.owner.wallpaper=$("#cfgWallpaper").value;
 appData.eventsEnabled=$("#cfgEvents").checked;
 appData.eventFreq=$("#cfgEventFreq").value;
 saveData(appData);
 applyWallpaper();
 startEventLoop();
 $("#configOverlay").classList.add("hidden");
 if(currentView==="home")renderHome();
}

function applyWallpaper(){
 const h=$("#homeScreen");
 h.style.background=appData.owner.wallpaper==="purple"?"linear-gradient(155deg,#d8c0ed,#8175bd 48%,#33254e)":"linear-gradient(145deg,#f3eee9,#d9d3d0)";
}

$("#addContactBtn").onclick=()=>{
 const name=prompt("联系人名字：");
 if(!name)return;
 appData.contacts.push({
  id:"c"+Date.now(),name,avatar:"👤",relation:"自定义",
  personality:"自然、真诚，有自己的想法。",emotion:"自然",
  relationshipScore:20,memories:[],lastMessage:"新对话",
  lastTime:"刚刚",unread:0,
  messages:[{from:"them",text:"嗨，终于聊上了。",time:getCurrentTimeStr()}]
 });
 saveData(appData);
 openConfig();
};

$("#exportBtn").onclick=()=>{
 const a=document.createElement("a");
 const url=URL.createObjectURL(new Blob([JSON.stringify(appData,null,2)],{type:"application/json"}));
 a.href=url;
 a.download="partnerwithin-data.json";
 a.click();
 URL.revokeObjectURL(url);
};

$("#importBtn").onclick=()=>$("#importFile").click();

$("#importFile").onchange=e=>{
 const file=e.target.files[0];
 if(!file)return;
 const r=new FileReader();
 r.onload=ev=>{
  try{
   appData=JSON.parse(ev.target.result);
   saveData(appData);
   alert("导入成功");
   openConfig();
  }catch(err){alert("导入失败：JSON 格式不正确");}
 };
 r.readAsText(file);
};

$("#resetBtn").onclick=()=>{
 if(confirm("确定重置？重置前请先导出备份。")){
  localStorage.removeItem("phoneSimData");
  location.reload();
 }
};

$$(".dock-app").forEach(e=>e.onclick=()=>openApp(e.dataset.app==="messages"?"whatsapp":e.dataset.app));

function escapeHTML(s){
 return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

applyWallpaper();



let eventTimer=null,timeOffset=0;

function getCurrentTimeStr(){
 const d=new Date(Date.now()+timeOffset*1000);
 return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
}

function startEventLoop(){
 if(eventTimer)clearInterval(eventTimer);
 if(!appData.eventsEnabled)return;
 const ms={low:60000,medium:35000,high:18000}[appData.eventFreq]||35000;
 eventTimer=setInterval(()=>{
  if(Math.random()<.45)triggerRandomEvent();
 },ms);
}

function triggerRandomEvent(){
 const list=appData.eventTemplates||[];
 const contacts=appData.contacts||[];
 if(!list.length||!contacts.length)return;
 const t=list[Math.floor(Math.random()*list.length)];
 const c=(t.contactId&&contacts.find(x=>x.id===t.contactId))||contacts[Math.floor(Math.random()*contacts.length)];

 if(t.type==="call"){
  showIncomingCall(c);
  return;
 }
 if(t.type==="notification"){
  showToast((t.title||"提醒")+": "+(t.body||"你有一条新提醒"));
  return;
 }

 const msg=t.text||"刚刚想到你了。";
 c.messages=c.messages||[];
 c.messages.push({from:"them",text:msg,time:getCurrentTimeStr()});
 c.lastMessage=msg;
 c.lastTime="刚刚";
 c.unread=(c.unread||0)+1;
 saveData(appData);
 updateBadges();
 showToast(c.name+": "+msg);
}

function showToast(msg){
 let el=document.getElementById("toast");
 if(!el){
  el=document.createElement("div");
  el.id="toast";
  document.getElementById("screen").appendChild(el);
 }
 el.textContent=msg;
 el.classList.remove("hidden");
 clearTimeout(el._timer);
 el._timer=setTimeout(()=>el.classList.add("hidden"),2800);
}

function showIncomingCall(c){
 const o=$("#callOverlay");
 $("#callName").textContent=c.name;
 o.classList.remove("hidden");
 const timer=setTimeout(declineCall,15000);

 $("#declineCall").onclick=()=>{
  clearTimeout(timer);
  declineCall();
 };
 $("#acceptCall").onclick=()=>{
  clearTimeout(timer);
  o.classList.add("hidden");
  showToast("与 "+c.name+" 通话中（模拟）");
 };
}

function declineCall(){
 $("#callOverlay").classList.add("hidden");
 showToast("已拒绝来电");
}

window.startEventLoop=startEventLoop;
window.triggerRandomEvent=triggerRandomEvent;
window.showIncomingCall=showIncomingCall;



(function(){
"use strict";

const KEY="partnerWithinAI";
const $=s=>document.querySelector(s);
const defaults={enabled:false,endpoint:"",model:"",temperature:0.8};

function settings(){
 try{
  return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")};
 }catch(e){
  return {...defaults};
 }
}

function saveSettings(p){
 const v={...settings(),...p};
 localStorage.setItem(KEY,JSON.stringify(v));
 return v;
}

function promptFor(c){
 return [
  "你是 Partner Within 中一个独立、持续存在的虚构聊天角色，不是客服。",
  "自然地用中文聊天，结合当前消息、近期对话、人物设定、关系与情绪回应。",
  "不要机械复述用户，不要每次都用问句结尾，不要一味讨好。",
  "可以有自己的意见、幽默、犹豫、忙碌和合理情绪；不要凭空声称发生过未记录的事情。",
  "回复通常1至5句，按情境调整。",
  "角色姓名："+c.name,
  "关系："+(c.relation||"熟人"),
  "人物设定："+(c.personality||"自然真诚"),
  "当前情绪："+(c.emotion||"自然"),
  "熟悉度："+Number(c.relationshipScore||25)+"/100",
  "共同记忆："+((c.memories||[]).slice(-12).join("；")||"暂无"),
  "不同角色不可混淆。人物档案是虚构角色设定，不要把它说成现实人物的私生活。"
 ].join("\n");
}

function localReply(c,t){
 const n=(c.name||"").toLowerCase();
 const p=c.personality||"";
 const s=t.toLowerCase();
 const mia=/mia|高中同学/.test(n)||/抽象有趣|脑回路清奇/.test(p);
 const anton=/anton|李灿荣/.test(n);
 const eamoon=/eamoon/.test(n);

 if(/难过|伤心|委屈|崩溃|不开心|累了|压力大/.test(s)){
  c.emotion="关心";
  if(mia)return "等一下，先把那些破事放旁边。你想吐槽我就听着，今天不强行灌鸡汤。认真说，你还好吗？";
  if(anton)return "听起来你今天真的不太轻松。先不用急着解决所有事，想说多少就说多少，我在听。";
  return "怎么了？你可以慢慢说，不用急着把情绪整理好再告诉我。";
 }

 if(/喜欢你|想你|想见你|抱抱|亲亲/.test(s)){
  c.emotion="害羞";
  c.relationshipScore=Math.min(100,Number(c.relationshipScore||25)+2);
  if(mia)return "停。这个发展我需要一份正式报告……开玩笑的啦。说真的，你是不是一边发消息一边偷笑？";
  if(anton)return "你这样说，我会认真记住的。其实……我也想见你，不只是随口说说的那种。";
  return "你突然这么说，我一时不知道怎么接。不是不喜欢听，只是有点意外。";
 }

 if(/生气|烦死|讨厌|别理我/.test(s)){
  c.emotion="谨慎";
  return "好，我先不跟你争。等你愿意说的时候，我想弄清楚是哪件事让你不舒服。";
 }

 if(/游泳|泳池|游得快|游泳馆/.test(s)&&anton){
  c.emotion="轻松";
  return "这个话题我可不谦虚。下次有机会带你去泳池，不过热身和安全不能省。你是想看我游，还是想学？";
 }

 if(/哈哈|笑死|好玩|离谱|抽象/.test(s)&&mia){
  c.emotion="开心";
  return "哈哈哈哈等一下，我脑子里的小人已经开始倒立鼓掌了。你先继续，我今天的精神状态允许我接住这个话题。";
 }

 if(/在干嘛|干什么|忙吗/.test(s)){
  c.emotion="自然";
  if(mia)return "正在进行一些看起来毫无意义、但本人觉得很有必要的活动。简称：快乐地浪费人生。你呢？";
  if(anton)return "刚忙完手头的事，准备休息一会儿。你来找我，我就先把别的放一放。你呢？";
  if(eamoon)return "刚剪完一点东西，眼睛快看花了。你呢？别告诉我又在熬夜。";
  return "刚忙完一点事，正好能喘口气。你呢，今天怎么样？";
 }

 const replies=mia?[
  "等一下，我的大脑正在加载一个很抽象但可能有用的回答……好了，你继续，我认真听着。",
  "这事有点意思。先不急着下结论，你再讲点细节，我想知道后续。",
  "我懂你在说什么（大概）。来，把前因后果交代一下，我尽量不跑偏。"
 ]:anton?[
  "嗯，我明白你的意思。你可以再说一点，我想听听你真正的想法。",
  "我会认真想一下。比起马上给答案，我更想先确认自己有没有理解错你。",
  "好，我记下了。你不用特意组织语言，按自己的方式说就好。"
 ]:eamoon?[
  "嗯，听起来确实有点意思。你继续，我在听。先说好，我可能会直接指出不合理的地方。",
  "我懂一点你的意思，但还想确认一下。你说的是这个方向吗？",
  "好，先不急着下结论。把细节发我，我们一起捋捋。"
 ]:[
  "嗯，我在听。然后呢？",
  "我想多了解一点，你愿意再说说吗？",
  "我大概明白你的意思了。你自己更倾向于怎么做？"
 ];

 c.emotion="自然";
 return replies[Math.floor(Math.random()*replies.length)];
}

async function generate(c,input){
 const cfg=settings();

 if(cfg.enabled&&cfg.endpoint){
  try{
   const recent=(c.messages||[]).slice(-22).map(m=>({
    role:m.from==="me"?"user":"assistant",
    content:String(m.text||"")
   }));

   const r=await fetch(cfg.endpoint,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     model:cfg.model||undefined,
     temperature:Number(cfg.temperature||0.8),
     messages:[
      {role:"system",content:promptFor(c)},
      ...recent,
      {role:"user",content:input}
     ]
    })
   });

   if(!r.ok)throw Error("接口返回 HTTP "+r.status);
   const d=await r.json();
   const answer=d.reply||d.message||d.choices?.[0]?.message?.content;
   if(!answer)throw Error("接口没有返回回复文本");
   if(d.emotion)c.emotion=String(d.emotion);
   if(Array.isArray(d.memories))c.memories=[...(c.memories||[]),...d.memories].slice(-30);
   return String(answer).trim();

  }catch(e){
   console.error(e);
   toast("AI 暂时连接失败，已切换本地角色回复");
  }
 }
 return localReply(c,input);
}

function toast(msg){
 if(typeof showToast==="function")showToast(msg);
 else alert(msg);
}

async function sendMessagePersona(){
 const input=$("#chatInput"),text=input?.value.trim();
 if(!text||!currentChatId)return;

 const c=appData.contacts.find(x=>x.id===currentChatId);
 if(!c)return;

 input.value="";
 c.messages=c.messages||[];
 c.messages.push({from:"me",text,time:clock()});
 c.lastMessage=text;
 c.lastTime="刚刚";
 saveData(appData);
 openChat(c.id);

 const b=$("#sendBtn");
 if(b)b.disabled=true;

 try{
  const answer=await generate(c,text);
  c.messages.push({from:"them",text:answer,time:clock()});
  c.lastMessage=answer;
  c.lastTime="刚刚";
  saveData(appData);

  if(currentChatId===c.id)openChat(c.id);
  else{
   c.unread=(c.unread||0)+1;
   updateBadges();
   toast(c.name+"："+answer);
  }
 }finally{
  const btn=$("#sendBtn");
  if(btn)btn.disabled=false;
 }
}

function clock(){
 return new Date().toLocaleTimeString("zh-CN",{
  hour:"2-digit",minute:"2-digit",hour12:false
 });
}

window.sendMessage=sendMessagePersona;
window.PersonaEngine={generate,settings,saveSettings,promptFor,localReply};

function init(){
 const en=$("#cfgAIEnabled");
 const ep=$("#cfgAIEndpoint");
 const mo=$("#cfgAIModel");
 const te=$("#cfgAITemperature");
 if(!en)return;

 function fill(){
  const c=settings();
  en.checked=c.enabled;
  ep.value=c.endpoint;
  mo.value=c.model;
  te.value=String(c.temperature||0.8);
 }

 fill();
 $("#configBtn")?.addEventListener("click",fill);

 $("#closeConfig")?.addEventListener("click",()=>{
  saveSettings({
   enabled:en.checked,
   endpoint:ep.value.trim(),
   model:mo.value.trim(),
   temperature:Number(te.value||0.8)
  });
 });

 $("#cfgAITest")?.addEventListener("click",async()=>{
  if(!ep.value.trim()){
   alert("请先填写后端接口地址。未部署后端时可关闭 AI 模式，先测试本地角色回复。");
   return;
  }

  const btn=$("#cfgAITest");
  btn.disabled=true;
  btn.textContent="测试中…";

  try{
   const r=await fetch(ep.value.trim(),{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
     messages:[{role:"user",content:"请只回复：连接成功"}],
     temperature:0.2
    })
   });

   if(!r.ok)throw Error("HTTP "+r.status);
   const d=await r.json();
   const msg=d.reply||d.choices?.[0]?.message?.content||d.message;
   if(!msg)throw Error("响应中没有回复文本");
   alert("连接成功："+String(msg).slice(0,120));

  }catch(e){
   alert("连接失败："+e.message+"。请检查接口地址、部署状态和 CORS。");
  }finally{
   btn.disabled=false;
   btn.textContent="测试 AI 连接";
  }
 });
}

if(document.readyState==="loading"){
 document.addEventListener("DOMContentLoaded",init);
}else{
 init();
}
})();


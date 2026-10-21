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
   "可以有自己的意见、幽默、犹豫、忙碌和合理情绪；不要凭空声称发��过未记录的事情。",
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
  const name=(c.name||"").toLowerCase();
  const personality=(c.personality||"").toLowerCase();
  const text=String(t||"").trim();
  const lower=text.toLowerCase();

  const mode=
   /mia|高中同学|抽象|脑回路/.test(name+" "+personality)?"mia":
   /anton|李灿荣/.test(name)?"anton":
   /eamoon/.test(name)?"eamoon":
   "default";

  if(/难过|伤心|委屈|崩溃|不开心|累了|压力大/.test(lower)){
   c.emotion="关心";
   if(mode==="mia")return "等一下，先把那些破事放一边。你想吐槽，我就在听，今天不来那套鸡汤式安慰。认真说，你还好吗？";
   if(mode==="anton")return "听起来你今天真的不太轻松。先别急着把所有事都扛起来，想说多少就说多少，我在听。";
   return "怎么了？你可以慢慢说，不用逼自己整理好再告诉我。";
  }

  if(/喜欢你|想你|想见你|抱抱|亲亲|想贴近你/.test(lower)){
   c.emotion="害羞";
   c.relationshipScore=Math.min(100,Number(c.relationshipScore||25)+2);
   if(mode==="mia")return "停，我需要一份正式授权书，证明这句话是你认真说出来的……开玩笑的啦。说真的，你这样说，我有点心动。";
   if(mode==="anton")return "你这样说，我会认真记住的。其实……我也有点想见你，不只是随口说说。";
   return "你突然这么说，我一时没法淡定。不是不喜欢听，只是有点意外。";
  }

  if(/生气|烦死|讨厌|别理我|不想说/.test(lower)){
   c.emotion="谨慎";
   return "好，我先不跟你争。等你愿意说的时候，我想弄清楚是哪件事让你不舒服。";
  }

  if(/在干嘛|干什么|忙吗|最近怎么样/.test(lower)){
   c.emotion="自然";
   if(mode==="mia")return "正在进行一堆看起来很没有必要，但本人觉得特别重要的事。简称：快乐地浪费人生。你呢？";
   if(mode==="anton")return "刚忙完手头的事，准备休息一会儿。你来找我，我就先把别的放一放。你呢？";
   if(mode==="eamoon")return "刚剪完一点东西，眼睛快看花了。你呢？别告诉我又在熬夜。";
   return "刚忙完一点事，正好喘口气。你呢，今天怎么样？";
  }

  if(/哈哈|笑死|好玩|离谱|抽象/.test(lower)&&mode==="mia"){
   c.emotion="开心";
   return "哈哈哈哈，等一下，我脑子里的小人已经开始倒立鼓掌了。你继续说，我今天的精神状态允许我接住这个梗。";
  }

  if(/游泳|泳池|游得快|游得很快/.test(lower)&&mode==="anton"){
   c.emotion="轻松";
   return "这个话题我可不谦虚。下次有机会带你去泳池，不过热身和安全不能省。你想看我游，还是想学？";
  }

  const pool={
   mia:[
    "我懂你在说什么（大概）。来，把前因后果交代一下，我尽量不跑偏。",
    "这事有点意思。先别急着下结论，细节往后说一点，我想知道你真正的想法。",
    "我明白你在讲什么了，至少大概明白。你继续说，我在听。"
   ],
   anton:[
    "我会认真想一下。比起马上���答案，我更想先确认自己有没有理解错你。",
    "嗯，我明白你的意思。你可以再说一点，我想听听你真正的想法。",
    "好，我记下了。你不用特意组织语言，按你的方式说就好。"
   ],
   eamoon:[
    "听起来确实有点意思。你继续，我在听。先说好，我可能会直接指出不合理的地方。",
    "我懂一点你的意思，但还想确认一下。你说的是这个方向吗？",
    "有点意思，我先把它拆开看一遍，再和你聊后面的部分。"
   ],
   default:[
    "嗯，我在听。然后呢？",
    "我想多了解一点，你愿意再说说吗？",
    "我大概明白你的意思了。你更倾向于怎么做？"
   ]
  };

  c.emotion="自然";
  return pool[mode][Math.floor(Math.random()*pool[mode].length)];
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


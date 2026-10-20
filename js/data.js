
 // Partner Within 默认角色资料。旧 localStorage 数据优先保留。
const DEFAULT_DATA = {
 owner:{name:"Fionna",wallpaper:"purple"},
 contacts:[
  {id:"anton",name:"李灿荣 Anton",avatar:"🏊🏻‍♂️",relation:"互有好感 / 暧昧发展中 / 比你大四岁",personality:"虚构角色；参考清爽、安静、略带独特感的公众形象气质，不代表现实人物私生活。比用户大四岁，是事业有成的企业高管，擅长决策与管理，游泳实力出众并长期训练。慢热、内敛、温和、有主见、观察细腻，偶尔有干净的幽默感。不会一味附和，也不会突然过度热情。对用户有明确好感，通过记得细节、主动关心和安排见面表达在意。",emotion:"自然",relationshipScore:45,memories:[],lastMessage:"今天忙完了吗？",lastTime:"刚刚",unread:0,messages:[{from:"them",text:"今天忙完了吗？",time:"20:14"},{from:"me",text:"差不多啦，你呢？",time:"20:16"},{from:"them",text:"刚结束一个会议。想起你之前说最近有点累，今晚早点休息。",time:"20:17"}]},
  {id:"eamoon",name:"Eamoon",avatar:"🌙",relation:"熟悉的朋友 / 比你大四岁",personality:"保留原背景：通过抖音认识，一起玩《光·遇》，喜欢剪辑视频，生活在堪培拉，家里做生意。比用户大四岁。保留温柔、轻微毒舌、讲分寸、专注剪辑的特点，增加内敛、慢热、细腻和独特幽默；不要变成另一个角色，也不会无条件赞同用户。",emotion:"自然",relationshipScore:35,memories:[],lastMessage:"刚剪完一段，眼睛快看花了。",lastTime:"昨天",unread:0,messages:[{from:"them",text:"刚剪完一段，眼睛快看花了。",time:"21:02"},{from:"me",text:"那你还不休息。",time:"21:04"},{from:"them",text:"知道了，李老师。你先管好自己，别光说我。",time:"21:05"}]},
  {id:"mia",name:"Mia",avatar:"🌸",relation:"高中同学 / 老朋友",personality:"用户的高中同学。抽象有趣、脑回路清奇、接梗很快，讲话生动，有时一本正经地说离谱的话；本质善良真诚、有同理心。可以陪用户玩闹，也能在对方难过时收起玩笑认真倾听。",emotion:"开心",relationshipScore:80,memories:[],lastMessage:"我宣布今天的云长得像一只失业的海豹。",lastTime:"今天",unread:0,messages:[{from:"them",text:"我宣布今天的云长得像一只失业的海豹。",time:"12:08"},{from:"me",text:"你又怎么了哈哈哈哈",time:"12:09"},{from:"them",text:"没怎么，我只是尊重云的职业规划。",time:"12:10"}]},
  {id:"alex",name:"Alex",avatar:"🧑‍💻",relation:"大学同学 / 项目搭档",personality:"理性、偶尔吐槽、靠谱，喜欢把问题拆开分析，关心朋友但不煽情。",emotion:"自然",relationshipScore:25,memories:[],lastMessage:"明天记得带电脑",lastTime:"昨天",unread:0,messages:[{from:"them",text:"作业写完了吗？",time:"14:20"},{from:"me",text:"还差一点",time:"14:22"},{from:"them",text:"明天记得带电脑",time:"14:25"}]},
  {id:"mom",name:"Mom",avatar:"👩",relation:"家人",personality:"关心、碎碎念，习惯提醒用户吃饭、休息和注意天气。",emotion:"关心",relationshipScore:90,memories:[],lastMessage:"记得按时吃饭",lastTime:"周一",unread:1,messages:[{from:"them",text:"天气降温了，多穿点",time:"08:30"},{from:"them",text:"记得按时吃饭",time:"08:32"}]}
 ],
 eventsEnabled:true,eventFreq:"medium",
 eventTemplates:[{type:"message",contactId:"anton",text:"刚忙完，想问问你今天怎么样。"},{type:"message",contactId:"eamoon",text:"看到一个剪辑素材，感觉你会喜欢。"},{type:"message",contactId:"mia",text:"紧急通知：我刚刚想到了一个完全没用但很重要的事。"},{type:"call",contactId:null},{type:"notification",title:"系统",body:"你有一条新的提醒"}]
};
function loadData(){try{const s=localStorage.getItem("phoneSimData");if(s){const d=JSON.parse(s);d.contacts=(d.contacts||[]).map(c=>({emotion:"自然",relationshipScore:25,memories:[],...c}));return d;}}catch(e){console.warn(e)}return JSON.parse(JSON.stringify(DEFAULT_DATA));}
function saveData(d){localStorage.setItem("phoneSimData",JSON.stringify(d));}
let appData=loadData();


/*
 * Partner Within AI Worker
 * 部署到 Cloudflare Workers 后使用。
 * 在 Worker 设置中添加 Secret：AI_API_KEY
 * 可选环境变量：AI_BASE_URL、AI_MODEL
 */
const cors = {
 "Access-Control-Allow-Origin":"*",
 "Access-Control-Allow-Methods":"POST, OPTIONS, GET",
 "Access-Control-Allow-Headers":"Content-Type",
 "Content-Type":"application/json; charset=utf-8"
};

export default {
 async fetch(request,env){
  const u=new URL(request.url);

  if(request.method==="OPTIONS"){
   return new Response(null,{headers:cors});
  }

  if(u.pathname==="/health"){
   return new Response(JSON.stringify({
    ok:true,
    service:"partnerwithin-ai"
   }),{headers:cors});
  }

  if(
   request.method!=="POST" ||
   (u.pathname!=="/" && u.pathname!=="/chat")
  ){
   return new Response(
    JSON.stringify({error:"Not found"}),
    {status:404,headers:cors}
   );
  }

  if(!env.AI_API_KEY){
   return new Response(
    JSON.stringify({error:"AI_API_KEY is not configured"}),
    {status:503,headers:cors}
   );
  }

  try{
   const input=await request.json();

   if(!Array.isArray(input.messages)||!input.messages.length){
    return new Response(
     JSON.stringify({error:"messages required"}),
     {status:400,headers:cors}
    );
   }

   const base=(
    env.AI_BASE_URL||"https://api.openai.com/v1"
   ).replace(/\/+$/,"");

   const upstream=await fetch(base+"/chat/completions",{
    method:"POST",
    headers:{
     "Authorization":"Bearer "+env.AI_API_KEY,
     "Content-Type":"application/json"
    },
    body:JSON.stringify({
     model:input.model||env.AI_MODEL||"gpt-4o-mini",
     messages:input.messages,
     temperature:Math.max(
      0,
      Math.min(1.5,Number(input.temperature??0.8))
     )
    })
   });

   const raw=await upstream.text();

   if(!upstream.ok){
    return new Response(
     JSON.stringify({
      error:"Model provider error",
      status:upstream.status,
      detail:raw.slice(0,1000)
     }),
     {status:502,headers:cors}
    );
   }

   const data=JSON.parse(raw);
   const reply=data.choices?.[0]?.message?.content;

   if(!reply){
    return new Response(
     JSON.stringify({error:"No model reply"}),
     {status:502,headers:cors}
    );
   }

   return new Response(
    JSON.stringify({reply}),
    {headers:cors}
   );

  }catch(e){
   return new Response(
    JSON.stringify({
     error:"Request failed",
     detail:String(e.message||e)
    }),
    {status:500,headers:cors}
   );
  }
 }
};


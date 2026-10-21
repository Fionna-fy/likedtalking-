export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const origin = request.headers.get("Origin") || "";

    if (
      origin &&
      origin !== "https://fionna-fy.github.io" &&
      !origin.endsWith(".github.io")
    ) {
      return json({ error: "Origin not allowed" }, 403);
    }

    try {
      const { message, history = [], persona = {} } = await request.json();

      if (!message?.trim()) {
        return json({ error: "message is required" }, 400);
      }

      const systemPrompt = `
你是“${persona.name || "AI 伙伴"}”。
与用户的关系：${persona.relation || "朋友"}。
性格：${persona.personality || "自然、真诚、有同理心"}。
当前情绪：${persona.emotion || "平静"}。
关系亲密度：${persona.relationshipScore ?? 20}/100。
长期��忆：${JSON.stringify(persona.memories || [])}。

要求：
1. 用中文自然对话，语气真实、有节奏、有一点情绪起伏。
2. 保持角色一致性，性格和关系感都要稳定。
3. 回复长度适中，通常 1–3 句，必要时可稍长，避免机械单句。
4. 让回复带一点情绪、幽默、犹豫或关心，不要一味平淡。
5. 参考聊天记录中的关系状态、情绪和近期记忆，不要重复套话。
6. 不要暴露你是 AI 模型，除非用户直接询问。
`.trim();

      const aiResponse = await fetch(env.AI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.AI_API_KEY}`
        },
        body: JSON.stringify({
          model: env.AI_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            ...history.slice(-12),
            { role: "user", content: message }
          ],
          temperature: 0.8
        })
      });

      if (!aiResponse.ok) {
        const detail = await aiResponse.text();
        console.error("AI provider error:", aiResponse.status, detail);
        return json({ error: "AI provider error" }, 502);
      }

      const data = await aiResponse.json();

      const reply =
        data?.choices?.[0]?.message?.content ||
        data?.output?.text ||
        "抱歉，我暂时没有想好怎么回复。";

      return json({ reply });
    } catch (err) {
      console.error(err);
      return json({ error: "Internal server error" }, 500);
    }
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://fionna-fy.github.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders()
    }
  });
}


const corsHeaders = (request) => {
  const origin = request.headers.get("Origin");
  const allowedOrigins = new Set([
    "https://fionna-fy.github.io",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ]);
  const allowOrigin = origin && allowedOrigins.has(origin) ? origin : "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8"
  };
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, service: "partnerwithin-ai" }), { headers });
    }

    if (request.method !== "POST" || (url.pathname !== "/" && url.pathname !== "/chat")) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });
    }

    if (!env.AI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI_API_KEY is not configured" }), { status: 503, headers });
    }

    try {
      const input = await request.json();
      if (!input || typeof input !== "object") {
        return new Response(JSON.stringify({ error: "Request body must be a JSON object" }), { status: 400, headers });
      }

      const messages = Array.isArray(input.messages) ? input.messages : [];
      const normalizedMessages = messages
        .filter((m) => m && typeof m === "object" && typeof m.content === "string")
        .slice(-25)
        .map((m) => ({ role: m.role === "user" || m.role === "assistant" || m.role === "system" ? m.role : "user", content: m.content.slice(0, 4000) }));

      if (!normalizedMessages.length) {
        return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers });
      }

      const base = (env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
      const upstream = await fetch(base + "/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + env.AI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: input.model || env.AI_MODEL || "gpt-4o-mini",
          messages: normalizedMessages,
          temperature: Math.max(0, Math.min(1.5, Number(input.temperature ?? 0.8)))
        })
      });

      const raw = await upstream.text();
      if (!upstream.ok) {
        return new Response(JSON.stringify({ error: "Model provider error", status: upstream.status, detail: raw.slice(0, 1000) }), { status: 502, headers });
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return new Response(JSON.stringify({ error: "Invalid model response" }), { status: 502, headers });
      }

      const reply = data.choices?.[0]?.message?.content;
      if (!reply || typeof reply !== "string") {
        return new Response(JSON.stringify({ error: "No model reply" }), { status: 502, headers });
      }

      return new Response(JSON.stringify({ reply: String(reply).trim() }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Request failed", detail: String(error?.message || error) }), { status: 500, headers });
    }
  }
};

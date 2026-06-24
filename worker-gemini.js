export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://shivamsoni24224.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const incoming = await request.json();

      // Convert the app's Anthropic-style messages into Gemini's "contents" format
      const contents = (incoming.messages || []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
          },
        ],
      }));

      const geminiBody = {
        contents,
        ...(incoming.system
          ? { systemInstruction: { parts: [{ text: incoming.system }] } }
          : {}),
        // Built-in web search/grounding, similar role to the old web_search tool.
        // If this causes an error for your model/key, just delete the "tools" line below.
        tools: [{ google_search: {} }],
      };

      const model = "gemini-2.5-flash"; // free-tier friendly model; swap if needed

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY, // secret, set in Cloudflare dashboard
          },
          body: JSON.stringify(geminiBody),
        }
      );

      const geminiData = await geminiRes.json();

      let text = "";
      const candidate = geminiData?.candidates?.[0];
      if (candidate?.content?.parts) {
        text = candidate.content.parts.map((p) => p.text || "").join("\n");
      }
      if (!text) {
        text = "⚠️ માફ કરો, જવાબ ન મળ્યો. ફરી પ્રયાસ કરો.";
      }

      // Shaped exactly like the Anthropic response, so index.html needs ZERO changes
      // beyond the fetch URL you already pointed at this Worker.
      const shaped = { content: [{ type: "text", text }] };

      return new Response(JSON.stringify(shaped), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          content: [{ type: "text", text: "⚠️ Server error. ફરી પ્રયાસ કરો." }],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  },
};
AQ.Ab8RN6I-JbOJA5AdzIcduPIBhuMWgxI7W2ov4NVbg-wB7QdOXA
Gemini API Key
projects/274469633114
274469633114

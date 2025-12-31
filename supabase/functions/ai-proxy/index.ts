// Supabase Edge Function: AI Proxy
// این function به عنوان proxy برای API های AI عمل می‌کند تا مشکل CORS حل شود

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*", // قبول همه headers برای جلوگیری از مشکلات CORS
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // دریافت تنظیمات از environment variables
    const aiApiKey = Deno.env.get("AI_API_KEY");
    const aiApiUrl = Deno.env.get("AI_API_URL") || "https://api.xiaomimimo.com/v1";

    if (!aiApiKey) {
      return new Response(
        JSON.stringify({ error: "AI API Key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // برای Supabase Edge Functions، authentication را optional می‌کنیم
    // این function به صورت public است و از Supabase secret برای API key استفاده می‌کند
    // header apikey یا Authorization را چک نمی‌کنیم (optional)

    // دریافت body درخواست
    const body = await req.json();
    
    // دریافت path از URL
    // URL format: https://xxx.supabase.co/functions/v1/ai-proxy/chat/completions
    // ما باید /chat/completions را استخراج کنیم
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p); // حذف empty strings
    // pathParts: ['functions', 'v1', 'ai-proxy', 'chat', 'completions']
    // ما باید بعد از 'ai-proxy' را بگیریم
    const aiProxyIndex = pathParts.indexOf('ai-proxy');
    const endpoint = aiProxyIndex >= 0 && aiProxyIndex < pathParts.length - 1
      ? '/' + pathParts.slice(aiProxyIndex + 1).join('/')
      : '/chat/completions'; // fallback

    // Forward request به AI API
    const aiResponse = await fetch(`${aiApiUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await aiResponse.json();

    return new Response(JSON.stringify(data), {
      status: aiResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in AI proxy:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


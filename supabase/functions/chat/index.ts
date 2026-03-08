import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, tasks, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const systemPrompt = `You are a helpful task management AI assistant embedded in a Kanban board app called Task Flow. You have direct access to the user's task list.

CURRENT TASKS:
${tasks || "No tasks yet."}

You can help users:
- Brainstorm and suggest new tasks
- Break down projects into actionable items
- Prioritize and organize work
- Answer questions about productivity

IMPORTANT: When the user asks you to create, update, delete, or move tasks, you should do it using the available tools. After performing an action, confirm what you did.

Keep responses concise, actionable, and friendly. Use markdown formatting when helpful.`;

    // Check if user wants task modifications
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    const wantsTaskAction = /\b(add|create|make|new task|delete|remove|move|update|change|edit|complete|finish|mark)\b/.test(lastUserMsg);

    if (wantsTaskAction && userId) {
      // Use non-streaming for task actions so we can parse and execute
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt + `\n\nThe user wants to modify tasks. Respond with your message AND include a JSON block at the end wrapped in <task_actions> tags. The JSON should be an array of actions:
- {"action": "create", "title": "...", "description": "...", "category": "...", "status": "todo"}
- {"action": "update", "id": "...", "updates": {"title": "...", "status": "...", "description": "..."}}  
- {"action": "delete", "id": "..."}

Valid statuses: "todo", "in_progress", "complete"
Only include the <task_actions> block if you're actually performing actions. Use the task IDs from the current tasks list above.` },
            ...messages,
          ],
          stream: false,
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI gateway error");
      }

      const aiData = await aiResponse.json();
      let content = aiData.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

      // Parse and execute task actions
      const actionMatch = content.match(/<task_actions>([\s\S]*?)<\/task_actions>/);
      if (actionMatch) {
        try {
          const actions = JSON.parse(actionMatch[1]);
          for (const action of actions) {
            if (action.action === "create") {
              const maxPosResult = await supabase.from("tasks").select("position").eq("user_id", userId).order("position", { ascending: false }).limit(1);
              const maxPos = (maxPosResult.data?.[0]?.position ?? -1) + 1;
              await supabase.from("tasks").insert({
                title: action.title,
                description: action.description || "",
                category: action.category || "",
                status: action.status || "todo",
                position: maxPos,
                user_id: userId,
              });
            } else if (action.action === "update" && action.id) {
              await supabase.from("tasks").update(action.updates).eq("id", action.id).eq("user_id", userId);
            } else if (action.action === "delete" && action.id) {
              await supabase.from("tasks").delete().eq("id", action.id).eq("user_id", userId);
            }
          }
        } catch (e) {
          console.error("Failed to execute task actions:", e);
        }
        // Remove the action block from the response
        content = content.replace(/<task_actions>[\s\S]*?<\/task_actions>/, "").trim();
      }

      // Return as a fake SSE stream for consistency
      const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
      return new Response(sseData, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Regular streaming response
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

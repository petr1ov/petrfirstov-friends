import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function db(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_stats",
  title: "CRM stats",
  description: "Return counts of leads, partners, bot users, and clicks.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const client = db(ctx);
    const [leads, partners, users, clicks] = await Promise.all([
      client.from("leads").select("id", { count: "exact", head: true }),
      client.from("partners").select("id", { count: "exact", head: true }),
      client.from("bot_users").select("id", { count: "exact", head: true }),
      client.from("clicks").select("id", { count: "exact", head: true }),
    ]);
    const stats = {
      leads: leads.count ?? 0,
      partners: partners.count ?? 0,
      bot_users: users.count ?? 0,
      clicks: clicks.count ?? 0,
    };
    return { content: [{ type: "text", text: JSON.stringify(stats) }], structuredContent: stats };
  },
});
import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function db(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "update_lead_status",
  title: "Update lead status",
  description: "Change a lead's funnel status (new / in_progress / client / rejected).",
  inputSchema: {
    lead_id: z.string().uuid().describe("Lead UUID."),
    status: z.enum(["new", "in_progress", "client", "rejected"]).describe("New status."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  needsApproval: true,
  handler: async ({ lead_id, status }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await db(ctx)
      .from("leads")
      .update({ status })
      .eq("id", lead_id)
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Lead not found" }], isError: true };
    return { content: [{ type: "text", text: `Updated lead ${data.name ?? lead_id} → ${status}` }], structuredContent: { lead: data } };
  },
});
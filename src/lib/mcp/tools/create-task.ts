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
  name: "create_task",
  title: "Create task",
  description: "Add a task to a project. Requires project_id and title.",
  inputSchema: {
    project_id: z.string().uuid(),
    title: z.string().min(1).max(500),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    type: z.string().optional().describe("Task type, e.g. 'scope' or 'ops'. Default 'ops'."),
    planned_for_date: z.string().optional().describe("ISO date, e.g. 2026-07-10."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await db(ctx)
      .from("tasks")
      .insert({
        project_id: input.project_id,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority ?? "medium",
        type: input.type ?? "ops",
        planned_for_date: input.planned_for_date ?? null,
        status: "todo",
        is_manual: true,
        steps: [],
      })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Created task: ${data?.title}` }], structuredContent: { task: data } };
  },
});
import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listLeadsTool from "./tools/list-leads";
import listPartnersTool from "./tools/list-partners";
import listCasesTool from "./tools/list-cases";
import getStatsTool from "./tools/get-stats";
import listProjectsTool from "./tools/list-projects";
import listTasksTool from "./tools/list-tasks";
import listPayoutsTool from "./tools/list-payouts";
import updateLeadStatusTool from "./tools/update-lead-status";
import createTaskTool from "./tools/create-task";
import completeTaskTool from "./tools/complete-task";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "petr-firstov-crm-mcp",
  title: "Petr Firstov CRM",
  version: "0.1.0",
  instructions:
    "Read-only access to the Petr Firstov CRM: leads, affiliate partners, portfolio cases, and top-line stats. Use `get_stats` for a quick overview, then drill in with `list_leads`, `list_partners`, or `list_cases`.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getStatsTool,
    listLeadsTool,
    listPartnersTool,
    listCasesTool,
    listProjectsTool,
    listTasksTool,
    listPayoutsTool,
    updateLeadStatusTool,
    createTaskTool,
    completeTaskTool,
  ],
});
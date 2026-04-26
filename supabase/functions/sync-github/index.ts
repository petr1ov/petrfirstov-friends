import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function parseRepo(repo: string): { owner: string; name: string } | null {
  // Supports: owner/name, https://github.com/owner/name, https://github.com/owner/name.git
  const m = repo.trim().match(/(?:github\.com[/:])?([^/\s]+)\/([^/\s.]+)(?:\.git)?$/);
  if (!m) return null;
  return { owner: m[1], name: m[2] };
}

async function syncProject(project: any) {
  if (!project.github_repo) return { skipped: true, reason: "no repo" };
  const parsed = parseRepo(project.github_repo);
  if (!parsed) return { skipped: true, reason: "bad repo format" };

  const url = `https://api.github.com/repos/${parsed.owner}/${parsed.name}/commits?per_page=10`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

  const resp = await fetch(url, { headers });
  if (!resp.ok) {
    const errText = await resp.text();
    console.error(`GitHub error for ${project.github_repo}:`, resp.status, errText);
    return { error: `GitHub ${resp.status}` };
  }

  const commits = await resp.json();
  if (!Array.isArray(commits) || commits.length === 0) {
    return { skipped: true, reason: "no commits" };
  }

  const last = commits[0];
  await supabase
    .from("projects")
    .update({
      last_commit_at: last.commit?.author?.date || new Date().toISOString(),
      last_commit_message: (last.commit?.message || "").split("\n")[0].slice(0, 200),
      commits_count: commits.length,
    })
    .eq("id", project.id);

  return { ok: true, commits: commits.length };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body?.project_id;

    let projects: any[] = [];
    if (projectId) {
      const { data } = await supabase.from("projects").select("*").eq("id", projectId);
      projects = data || [];
    } else {
      const { data } = await supabase.from("projects").select("*").not("github_repo", "is", null);
      projects = data || [];
    }

    const results = [];
    for (const p of projects) {
      const res = await syncProject(p);
      results.push({ project: p.name, ...res });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sync-github error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchAllRepos(): Promise<any[]> {
  const repos: any[] = [];
  for (let page = 1; page <= 10; page++) {
    const resp = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`GitHub ${resp.status}: ${text.slice(0, 200)}`);
    }
    const batch = await resp.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: "GITHUB_TOKEN не настроен" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dry_run;
    const overwrite = !!body?.overwrite;

    const repos = await fetchAllRepos();
    console.log(`Fetched ${repos.length} repos from GitHub`);

    // Index repos by normalized name
    const byName = new Map<string, any>();
    for (const r of repos) {
      byName.set(normalize(r.name), r);
    }

    const { data: projects } = await supabase.from("projects").select("id, name, github_repo");
    const matches: any[] = [];
    const unmatched: string[] = [];

    for (const p of projects || []) {
      if (p.github_repo && !overwrite) continue;
      const key = normalize(p.name);
      let repo = byName.get(key);

      // Fallback: fuzzy contains
      if (!repo) {
        for (const [rk, r] of byName) {
          if (rk.includes(key) || key.includes(rk)) {
            repo = r;
            break;
          }
        }
      }

      if (repo) {
        const full = repo.full_name; // owner/name
        matches.push({ project: p.name, id: p.id, repo: full });
        if (!dryRun) {
          await supabase.from("projects").update({ github_repo: full }).eq("id", p.id);
        }
      } else {
        unmatched.push(p.name);
      }
    }

    // Trigger sync for newly linked projects
    if (!dryRun && matches.length > 0) {
      supabase.functions
        .invoke("sync-github", { body: {} })
        .catch((e) => console.error("sync-github invoke failed", e));
    }

    return new Response(
      JSON.stringify({
        ok: true,
        dry_run: dryRun,
        total_repos: repos.length,
        matched: matches.length,
        unmatched: unmatched.length,
        matches,
        unmatched_projects: unmatched,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("discover-github-repos error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
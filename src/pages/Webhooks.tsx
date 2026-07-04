import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Webhook, CheckCircle2, AlertCircle, Download, Search } from "lucide-react";
import { Link } from "react-router-dom";

type Row = {
  id: string;
  name: string;
  status: string;
  lovable_project_id: string | null;
  last_commit_at: string | null;
  last_commit_message: string | null;
};

export default function Webhooks() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState<string>("");
  const [supabaseUrl, setSupabaseUrl] = useState<string>("");
  const [q, setQ] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const [{ data }, { data: cfg }] = await Promise.all([
        supabase
          .from("projects")
          .select("id, name, status, lovable_project_id, last_commit_at, last_commit_message")
          .order("name"),
        supabase.functions.invoke("get-lovable-webhook-url", { body: {} }),
      ]);
      setRows((data as Row[]) || []);
      if (cfg?.secret) setSecret(cfg.secret);
      if (cfg?.url) {
        try {
          const u = new URL(cfg.url);
          setSupabaseUrl(`${u.protocol}//${u.host}`);
        } catch {}
      }
      setLoading(false);
    })();
  }, []);

  const base = supabaseUrl ? `${supabaseUrl}/functions/v1/lovable-webhook` : "";
  const buildUrl = () => (secret ? `${base}?secret=${secret}` : base);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        (r.lovable_project_id || "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  const linked = rows.filter((r) => r.lovable_project_id).length;
  const withEvents = rows.filter((r) => r.last_commit_at).length;

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    toast({ title: "Скопировано" });
  };

  const copyAll = async () => {
    const url = buildUrl();
    if (!url) return;
    const lines = rows
      .filter((r) => r.lovable_project_id)
      .map((r) => `${r.name}\t${r.lovable_project_id}\t${url}`);
    const text = `Project Name\tLovable Project ID\tWebhook URL\n${lines.join("\n")}`;
    await navigator.clipboard.writeText(text);
    toast({ title: `Скопировано ${lines.length} строк`, description: "TSV: можно вставить в таблицу" });
  };

  const downloadCsv = () => {
    const url = buildUrl();
    const lines = ["name,lovable_project_id,webhook_url"];
    rows
      .filter((r) => r.lovable_project_id)
      .forEach((r) => lines.push(`"${r.name.replace(/"/g, '""')}",${r.lovable_project_id},${url}`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lovable-webhooks.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Webhook className="h-6 w-6" /> Webhook URL для Lovable
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Один URL на все проекты — маршрутизация внутри по <code>lovable_project_id</code> из payload. Вставьте его в{" "}
          <b>Project Settings → Webhooks → Add webhook</b> в каждом Lovable-проекте.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Универсальный URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col md:flex-row gap-2">
            <Input readOnly value={buildUrl()} className="font-mono text-xs" />
            <Button onClick={() => copy(buildUrl(), "__all__")} disabled={!secret}>
              <Copy className="h-4 w-4 mr-1" />
              {copiedId === "__all__" ? "Скопировано!" : "Копировать"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            События: <code>deploy.success</code>, <code>deploy.failed</code>, <code>publish</code>. Секрет уже вшит в
            query-параметр.
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Всего проектов" value={rows.length} />
        <StatCard label="С Lovable ID" value={linked} accent="primary" />
        <StatCard label="Уже приходят события" value={withEvents} accent="success" />
        <StatCard label="Без Lovable ID" value={rows.length - linked} accent="warn" />
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Проекты</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск"
                className="pl-7 h-8 w-52"
              />
            </div>
            <Button size="sm" variant="outline" onClick={copyAll} disabled={!secret}>
              <Copy className="h-3 w-3 mr-1" /> Копировать всё (TSV)
            </Button>
            <Button size="sm" variant="outline" onClick={downloadCsv} disabled={!secret}>
              <Download className="h-3 w-3 mr-1" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((r) => {
                const linked = !!r.lovable_project_id;
                const active = !!r.last_commit_at;
                return (
                  <div key={r.id} className="py-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/projects`} className="font-medium hover:underline truncate">
                          {r.name}
                        </Link>
                        <Badge variant={r.status === "active" ? "default" : "secondary"} className="text-[10px]">
                          {r.status}
                        </Badge>
                        {active && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> получает события
                          </span>
                        )}
                        {!linked && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400">
                            <AlertCircle className="h-3 w-3" /> нет Lovable ID
                          </span>
                        )}
                      </div>
                      {r.lovable_project_id && (
                        <code className="text-[10px] text-muted-foreground break-all">
                          {r.lovable_project_id}
                        </code>
                      )}
                      {r.last_commit_message && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          💬 {r.last_commit_message}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={copiedId === r.id ? "default" : "outline"}
                      onClick={() => copy(buildUrl(), r.id)}
                      disabled={!secret || !linked}
                      className="md:w-40"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedId === r.id ? "Скопировано!" : "Копировать URL"}
                    </Button>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">Ничего не найдено</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "primary" | "success" | "warn";
}) {
  const color =
    accent === "primary"
      ? "text-primary"
      : accent === "success"
        ? "text-emerald-400"
        : accent === "warn"
          ? "text-amber-400"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="py-4">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LevelOption = { id: string; index: number; title: string };
type LintFinding = { severity: "ERROR" | "WARNING" | "INFO"; code: string; message: string; location?: string };

const SEVERITY_STYLE: Record<LintFinding["severity"], string> = {
  ERROR: "bg-destructive/10 text-destructive",
  WARNING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  INFO: "bg-secondary text-secondary-foreground",
};

export function ImportExportPanel({ levels }: { levels: LevelOption[] }) {
  const [kind, setKind] = useState<"full" | "outline">("outline");
  const [languageCode, setLanguageCode] = useState("zh");
  const [languageName, setLanguageName] = useState("Mandarin Chinese");
  const [json, setJson] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [lintFindings, setLintFindings] = useState<LintFinding[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [exportLevelId, setExportLevelId] = useState(levels[0]?.id ?? "");
  const [exportedJson, setExportedJson] = useState("");

  async function handleImport() {
    setSubmitting(true);
    setResult(null);
    setLintFindings([]);
    try {
      const level = JSON.parse(json);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ languageCode, languageName, kind, level }),
      });
      const data = await res.json();
      setLintFindings(data.lintFindings ?? []);
      if (!res.ok) {
        const issues = data.issues
          ?.map(
            (i: { path: (string | number)[]; message: string }) =>
              `${i.path.join(".")}: ${i.message}`,
          )
          .join("\n");
        setResult({
          ok: false,
          message: issues || data.error || "Import failed.",
        });
      } else {
        setResult({
          ok: true,
          message: `Imported level ${data.level.index}: ${data.level.title}`,
        });
      }
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : "Invalid JSON." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExport() {
    const res = await fetch(`/api/admin/export/${exportLevelId}`);
    const data = await res.json();
    setExportedJson(JSON.stringify(data, null, 2));
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 rounded-2xl p-4">
        <p className="font-medium">Import level JSON</p>
        <p className="text-sm text-muted-foreground">
          This is how Levels 3-8 and future languages get filled in without touching
          application code — paste JSON matching the outline or full lesson schema.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Kind</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as "full" | "outline")}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outline">Outline (objectives only)</SelectItem>
                <SelectItem value="full">
                  Full (grammar/vocab/dialogue/exercises)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Language code</Label>
            <Input
              value={languageCode}
              onChange={(e) => setLanguageCode(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Language name</Label>
          <Input value={languageName} onChange={(e) => setLanguageName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Level JSON</Label>
          <Textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={10}
            className="font-mono text-xs"
            placeholder='{ "index": 3, "title": "...", "description": "...", "modules": [...] }'
          />
        </div>
        <Button onClick={handleImport} disabled={submitting || !json.trim()}>
          {submitting ? "Importing..." : "Validate & Import"}
        </Button>
        {result && (
          <pre
            className={`overflow-x-auto rounded-xl p-3 text-xs whitespace-pre-wrap ${
              result.ok
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {result.message}
          </pre>
        )}
        {lintFindings.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Content lint — {lintFindings.filter((f) => f.severity === "ERROR").length} error(s),{" "}
              {lintFindings.filter((f) => f.severity === "WARNING").length} warning(s),{" "}
              {lintFindings.filter((f) => f.severity === "INFO").length} info
            </p>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {lintFindings.map((f, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-xs ${SEVERITY_STYLE[f.severity]}`}
                >
                  <span className="font-semibold">{f.severity}</span> [{f.code}]{" "}
                  {f.location && <span className="opacity-80">{f.location}: </span>}
                  {f.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="space-y-4 rounded-2xl p-4">
        <p className="font-medium">Export level JSON</p>
        <div className="flex gap-2">
          <Select value={exportLevelId} onValueChange={setExportLevelId}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {levels.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  Level {l.index} · {l.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={handleExport} disabled={!exportLevelId}>
            Export
          </Button>
        </div>
        {exportedJson && (
          <Textarea
            readOnly
            value={exportedJson}
            rows={10}
            className="font-mono text-xs"
          />
        )}
      </Card>
    </div>
  );
}

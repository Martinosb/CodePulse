"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Target, Trash2, Check, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { useToast } from "@/components/ui/toast";
import { createGoal, deleteGoal } from "@/lib/actions/goals";
import { POPULAR_LANGUAGES } from "@/lib/constants";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export type GoalRow = {
  id: string;
  title: string;
  language: string | null;
  duration_seconds_target: number;
  frequency: "daily" | "weekly";
  status: "active" | "completed" | "failed" | "archived";
  period_start: string;
  computed_seconds: number;
  created_at: string;
};

export function GoalsClient({ goals }: { goals: GoalRow[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow mb-1.5">Stay accountable</p>
          <h1 className="text-display-md text-ink">Goals</h1>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set a daily or weekly target — like “Code 1h of Python today” — and we'll track it against your real WakaTime activity."
          action={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> Create your first goal</Button>}
        />
      ) : (
        <Stagger className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence>
            {goals.map((g) => (
              <StaggerItem key={g.id}>
                <GoalCard goal={g} />
              </StaggerItem>
            ))}
          </AnimatePresence>
        </Stagger>
      )}

      <GoalComposer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function GoalCard({ goal }: { goal: GoalRow }) {
  const router = useRouter();
  const { push } = useToast();
  const [deleting, setDeleting] = useState(false);

  const pct = Math.min(100, (goal.computed_seconds / goal.duration_seconds_target) * 100);
  const done = goal.computed_seconds >= goal.duration_seconds_target;

  async function onDelete() {
    setDeleting(true);
    const res = await deleteGoal(goal.id);
    if (res.ok) {
      push({ tone: "success", title: "Goal removed" });
      router.refresh();
    } else {
      push({ tone: "error", title: "Couldn't delete", description: res.error });
      setDeleting(false);
    }
  }

  return (
    <motion.div layout exit={{ opacity: 0, scale: 0.96 }}>
      <Card className={cn("p-5", done && "border-success/40 bg-success/[0.04]")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {done && (
                <span className="grid size-5 place-items-center rounded-full bg-success text-on-primary">
                  <Check className="size-3" />
                </span>
              )}
              <h3 className="truncate text-title-md text-ink">{goal.title}</h3>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {goal.language && <Badge tone="read">{goal.language}</Badge>}
              <Badge tone="neutral" className="gap-1">
                {goal.frequency === "daily" ? <Clock className="size-3" /> : <CalendarDays className="size-3" />}
                {goal.frequency}
              </Badge>
              {done && <Badge tone="success">Completed</Badge>}
            </div>
          </div>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="shrink-0 rounded p-1.5 text-muted transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50"
            aria-label="Delete goal"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-baseline justify-between text-body-sm">
            <span className={cn("font-medium tabular", done ? "text-success" : "text-ink")}>
              {formatDuration(goal.computed_seconds)}
            </span>
            <span className="text-muted tabular">/ {formatDuration(goal.duration_seconds_target)}</span>
          </div>
          <Progress value={pct} tone={done ? "success" : "primary"} />
        </div>
      </Card>
    </motion.div>
  );
}

const PRESETS = [
  { label: "30m", seconds: 1800 },
  { label: "1h", seconds: 3600 },
  { label: "2h", seconds: 7200 },
  { label: "4h", seconds: 14400 },
];

function GoalComposer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [seconds, setSeconds] = useState(3600);
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle("");
    setLanguage("");
    setSeconds(3600);
    setFrequency("daily");
  }

  async function submit() {
    setLoading(true);
    const res = await createGoal({
      title: title.trim() || (language ? `Code ${language}` : "Code consistently"),
      language: language || null,
      durationSeconds: seconds,
      frequency,
    });
    setLoading(false);
    if (res.ok) {
      push({ tone: "success", title: "Goal created 🎯" });
      reset();
      onClose();
      router.refresh();
    } else {
      push({ tone: "error", title: "Couldn't create goal", description: res.error });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New goal"
      description="Track real coding time against a target."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading}>Create goal</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Grind LeetCode in Python"
          />
        </div>

        <div>
          <Label htmlFor="lang">Language <span className="font-normal text-muted">(optional)</span></Label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setLanguage("")}
              className={cn(
                "rounded-pill border px-3 py-1.5 text-body-sm transition-colors",
                language === "" ? "border-primary bg-primary/8 text-ink" : "border-hairline-strong text-muted hover:text-ink",
              )}
            >
              Any
            </button>
            {POPULAR_LANGUAGES.slice(0, 8).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={cn(
                  "rounded-pill border px-3 py-1.5 text-body-sm transition-colors",
                  language === l ? "border-primary bg-primary/8 text-ink" : "border-hairline-strong text-muted hover:text-ink",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <FieldHint>Pick a language to track only that language's time.</FieldHint>
        </div>

        <div>
          <Label>Target</Label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setSeconds(p.seconds)}
                className={cn(
                  "rounded-md border px-4 py-2 text-body-sm font-medium transition-colors",
                  seconds === p.seconds ? "border-primary bg-primary/8 text-ink" : "border-hairline-strong text-muted hover:text-ink",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Frequency</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["daily", "weekly"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-4 py-2.5 text-body-sm font-medium capitalize transition-colors",
                  frequency === f ? "border-primary bg-primary/8 text-ink" : "border-hairline-strong text-muted hover:text-ink",
                )}
              >
                {f === "daily" ? <Clock className="size-4" /> : <CalendarDays className="size-4" />}
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

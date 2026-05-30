"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ExternalLink,
  KeyRound,
  Users,
  PlusCircle,
  Sparkles,
  Copy,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useToast } from "@/components/ui/toast";
import { connectWakatime } from "@/lib/actions/wakatime";
import { createGroup, joinGroup } from "@/lib/actions/groups";
import { cn } from "@/lib/utils";

const STEPS = ["Welcome", "Connect WakaTime", "Your group"] as const;

export function OnboardingWizard({
  displayName,
  wakatimeConnected,
}: {
  displayName: string;
  wakatimeConnected: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [connected, setConnected] = useState(wakatimeConnected);

  function go(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>

      <div className="mx-auto w-full max-w-xl flex-1 px-5 pb-12 sm:px-8">
        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-caption font-semibold transition-all duration-300",
                    i <= step
                      ? "bg-primary text-on-primary"
                      : "bg-surface-strong text-muted"
                  )}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={cn("hidden text-body-sm sm:block", i <= step ? "text-ink" : "text-muted")}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-hairline" />
              )}
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {step === 0 && <WelcomeStep displayName={displayName} onNext={() => go(1)} />}
              {step === 1 && (
                <ConnectStep
                  connected={connected}
                  onConnected={() => {
                    setConnected(true);
                    push({ tone: "success", title: "WakaTime connected", description: "Your coding data will sync automatically." });
                  }}
                  onNext={() => go(2)}
                  onBack={() => go(0)}
                />
              )}
              {step === 2 && (
                <GroupStep
                  onBack={() => go(1)}
                  onDone={() => {
                    router.replace("/dashboard");
                    router.refresh();
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StepCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-hairline bg-surface-card p-6 sm:p-8">{children}</div>;
}

function WelcomeStep({ displayName, onNext }: { displayName: string; onNext: () => void }) {
  return (
    <StepCard>
      <span className="mb-5 grid size-12 place-items-center rounded-xl bg-primary/12">
        <Sparkles className="size-6 text-primary" />
      </span>
      <h1 className="text-display-sm text-ink">Hey {displayName}, welcome to CodePulse 👋</h1>
      <p className="mt-3 text-body-md text-body">
        Two quick steps and you're in: connect your WakaTime account so we can read your coding
        activity, then join or create your group. Let's go.
      </p>
      <div className="mt-6 space-y-2.5">
        {[
          "Connect WakaTime (paste one API key)",
          "Join your cohort or start a new group",
          "Set goals and climb the leaderboard",
        ].map((t) => (
          <div key={t} className="flex items-center gap-2.5 text-body-sm text-ink">
            <CheckCircle2 className="size-4 text-success" /> {t}
          </div>
        ))}
      </div>
      <Button size="lg" fullWidth className="mt-7" onClick={onNext}>
        Let's set up <ArrowRight className="size-4" />
      </Button>
    </StepCard>
  );
}

function ConnectStep({
  connected,
  onConnected,
  onNext,
  onBack,
}: {
  connected: boolean;
  onConnected: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(connected);

  async function handleConnect() {
    setError(null);
    setLoading(true);
    const res = await connectWakatime(apiKey);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
    onConnected();
  }

  return (
    <StepCard>
      <span className="mb-5 grid size-12 place-items-center rounded-xl bg-tl-read/30">
        <KeyRound className="size-6 text-ink" />
      </span>
      <h1 className="text-display-sm text-ink">Connect WakaTime</h1>
      <p className="mt-3 text-body-sm text-body">
        WakaTime is a free plugin that tracks coding time in your editor. We only read your stats —
        and your key is encrypted before it's stored.
      </p>

      <ol className="mt-5 space-y-2 text-body-sm text-body">
        <li className="flex gap-2">
          <span className="font-mono text-code text-primary">1.</span>
          <span>
            No account yet?{" "}
            <a href="https://wakatime.com/signup" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Create one free <ExternalLink className="size-3" />
            </a>{" "}
            and install the plugin for your IDE.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-mono text-code text-primary">2.</span>
          <span>
            Grab your secret key from{" "}
            <a href="https://wakatime.com/settings/api-key" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              wakatime.com/settings/api-key <ExternalLink className="size-3" />
            </a>
          </span>
        </li>
      </ol>

      {done ? (
        <div className="mt-6 flex items-center gap-2 rounded-md border border-success/30 bg-success/8 p-3.5 text-body-sm text-success">
          <CheckCircle2 className="size-4" /> WakaTime is connected. You're all set.
        </div>
      ) : (
        <div className="mt-6">
          <Label htmlFor="wk">WakaTime API key</Label>
          <Input
            id="wk"
            type="password"
            value={apiKey}
            invalid={!!error}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="waka_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
          {error ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-caption text-error">
              <AlertCircle className="size-3.5" /> {error}
            </p>
          ) : (
            <FieldHint>We verify the key with WakaTime before saving it.</FieldHint>
          )}
          <Button className="mt-4" fullWidth loading={loading} disabled={!apiKey} onClick={handleConnect}>
            Verify & connect
          </Button>
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {!done && (
            <Button variant="ghost" size="sm" onClick={onNext}>
              Skip for now
            </Button>
          )}
          <Button size="sm" disabled={!done} onClick={onNext}>
            Continue <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </StepCard>
  );
}

function GroupStep({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const { push } = useToast();
  const [mode, setMode] = useState<"join" | "create">("join");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    if (mode === "join") {
      const res = await joinGroup(value);
      setLoading(false);
      if (!res.ok) return setError(res.error);
      push({ tone: "success", title: `Joined ${res.data?.name ?? "group"}!` });
      onDone();
    } else {
      const res = await createGroup(value);
      setLoading(false);
      if (!res.ok) return setError(res.error);
      setCreatedCode(res.data?.joinCode ?? null);
    }
  }

  if (createdCode) {
    return (
      <StepCard>
        <span className="mb-5 grid size-12 place-items-center rounded-xl bg-tl-done/30">
          <Check className="size-6 text-ink" />
        </span>
        <h1 className="text-display-sm text-ink">Your group is live 🎉</h1>
        <p className="mt-3 text-body-sm text-body">
          Share this code with your cohort so they can join. You can find it again any time in Settings.
        </p>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(createdCode);
            push({ tone: "success", title: "Code copied" });
          }}
          className="group mt-5 flex w-full items-center justify-between rounded-lg border border-hairline-strong bg-canvas-soft px-5 py-4 transition-colors hover:border-primary/50"
        >
          <span className="font-mono text-display-sm tracking-[0.2em] text-ink">{createdCode}</span>
          <span className="flex items-center gap-1.5 text-body-sm text-muted group-hover:text-primary">
            <Copy className="size-4" /> Copy
          </span>
        </button>
        <Button size="lg" fullWidth className="mt-7" onClick={onDone}>
          Enter dashboard <ArrowRight className="size-4" />
        </Button>
      </StepCard>
    );
  }

  return (
    <StepCard>
      <span className="mb-5 grid size-12 place-items-center rounded-xl bg-tl-grep/30">
        <Users className="size-6 text-ink" />
      </span>
      <h1 className="text-display-sm text-ink">Join or create a group</h1>
      <p className="mt-3 text-body-sm text-body">
        Groups are where the leaderboard lives. Join your cohort's, or start one and invite them.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <ModeButton active={mode === "join"} onClick={() => { setMode("join"); setValue(""); setError(null); }} icon={Users} label="Join a group" />
        <ModeButton active={mode === "create"} onClick={() => { setMode("create"); setValue(""); setError(null); }} icon={PlusCircle} label="Create a group" />
      </div>

      <div className="mt-5">
        <Label htmlFor="grp">{mode === "join" ? "Group code" : "Group name"}</Label>
        <Input
          id="grp"
          value={value}
          invalid={!!error}
          onChange={(e) => setValue(mode === "join" ? e.target.value.toUpperCase() : e.target.value)}
          placeholder={mode === "join" ? "CP-8K2Q" : "KNUST CS '27"}
          className={mode === "join" ? "font-mono tracking-widest" : ""}
        />
        {error && (
          <p className="mt-1.5 flex items-center gap-1.5 text-caption text-error">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button size="sm" loading={loading} disabled={!value.trim()} onClick={handleSubmit}>
          {mode === "join" ? "Join group" : "Create group"} <ArrowRight className="size-4" />
        </Button>
      </div>
    </StepCard>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-hairline-strong hover:bg-canvas-soft",
      )}
    >
      <Icon className={cn("size-5", active ? "text-primary" : "text-muted")} />
      <span className={cn("text-title-sm", active ? "text-ink" : "text-body")}>{label}</span>
    </button>
  );
}

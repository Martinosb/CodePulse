"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, MailCheck } from "lucide-react";
import { Input, Label, FieldHint } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/actions/auth";

export function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const res = await signUp({ email, password, displayName });
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    if (res.needsConfirmation) {
      setSentTo(email);
      setLoading(false);
      return;
    }
    router.replace("/onboarding");
    router.refresh();
  }

  if (sentTo) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-hairline bg-surface-card p-6 text-center"
      >
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-tl-grep/30">
          <MailCheck className="size-6 text-ink" />
        </span>
        <h2 className="text-title-md text-ink">Check your inbox</h2>
        <p className="mt-2 text-body-sm text-body">
          We sent a confirmation link to <span className="font-medium text-ink">{sentTo}</span>.
          Click it to activate your account and start onboarding.
        </p>
        <Link href="/login" className="mt-5 inline-block text-body-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-md border border-error/30 bg-error/8 p-3 text-body-sm text-error"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
      <div>
        <Label htmlFor="name">Display name</Label>
        <Input
          id="name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ada Lovelace"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
        <FieldHint>Use 6+ characters. You can change it later.</FieldHint>
      </div>
      <Button type="submit" size="lg" fullWidth loading={loading}>
        Create account
      </Button>
      <p className="text-center text-body-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

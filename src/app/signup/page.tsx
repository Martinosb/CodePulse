import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <AuthShell
      heading="Start your streak"
      subheading="Create an account, join your group, and connect WakaTime."
    >
      <SignupForm />
    </AuthShell>
  );
}

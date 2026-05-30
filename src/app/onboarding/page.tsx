import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding/wizard";

export const metadata: Metadata = { title: "Get set up" };

export default async function OnboardingPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login");

  // Already fully set up → straight to the app.
  if (session.profile?.onboarded && session.profile?.group_id) {
    redirect("/dashboard");
  }

  return (
    <OnboardingWizard
      displayName={session.profile?.display_name ?? "there"}
      wakatimeConnected={session.profile?.wakatime_connected ?? false}
    />
  );
}

import { getSessionProfile } from "@/lib/auth";
import { Landing } from "@/components/marketing/landing";

export default async function HomePage() {
  const session = await getSessionProfile();
  const isAuthed = !!session;
  const onboarded = !!session?.profile?.onboarded && !!session?.profile?.group_id;
  return <Landing isAuthed={isAuthed} onboarded={onboarded} />;
}

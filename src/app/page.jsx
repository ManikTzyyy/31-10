import { redirect } from "next/navigation";
import HomePageClient from "@/components/HomePageClient";
import { COUNTDOWN_TARGET } from "@/lib/countdown";

export const dynamic = "force-dynamic";

export default function HomePage() {
  if (Date.now() < COUNTDOWN_TARGET) {
    redirect("/countdown");
  }

  return <HomePageClient />;
}

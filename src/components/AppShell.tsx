import { BottomNav } from "@/components/BottomNav";

/** Full-height mobile layout with the bottom navigation. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-bg">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <BottomNav />
    </div>
  );
}

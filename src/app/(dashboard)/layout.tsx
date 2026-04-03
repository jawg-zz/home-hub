import { ReactNode } from "react";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/DashboardNav";
import { ToastProvider } from "@/components/Toast";
import SkipLink from "@/components/SkipLink";
import ErrorBoundary from "@/components/ErrorBoundary";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <SkipLink />
        <DashboardNav session={session} signOutAction={signOutAction}>
          {children}
        </DashboardNav>
      </ToastProvider>
    </ErrorBoundary>
  );
}

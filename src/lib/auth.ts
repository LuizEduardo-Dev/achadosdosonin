import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function isAdminUser(user: User | null): boolean {
  if (!user) return false;

  const hasAdminClaim = user.app_metadata?.role === "admin";
  if (hasAdminClaim) {
    return true;
  }

  const allowedEmail = getServerEnv().ADMIN_EMAIL;
  if (allowedEmail && user.email?.toLowerCase() === allowedEmail) {
    return true;
  }

  return false;
}

export async function getAuthenticatedAdmin(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !isAdminUser(user)) {
    return null;
  }

  return user;
}

export async function requireAdmin(): Promise<User> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

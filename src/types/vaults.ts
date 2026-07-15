import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface Vault {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  target_amount: number;
  current_savings: number;
  target_date: string | null;
  streak_multiplier: number;
  active_shields: number;
}

export interface VaultMember {
  id: string;
  vault_id: string;
  user_id: string;
  role: "owner" | "member" | "child";
  joined_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export async function getUserVaults() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: memberships, error: memberError } = await supabase
    .from("vault_members")
    .select("vault_id")
    .eq("user_id", user.id);

  if (memberError) throw memberError;
  if (!memberships || memberships.length === 0) return [];

  const vaultIds = memberships.map((m) => m.vault_id);

  const { data: vaults, error: vaultError } = await supabase
    .from("vaults")
    .select(`
      *,
      vault_members (
        id,
        user_id,
        role,
        joined_at
      )
    `)
    .in("id", vaultIds);

  if (vaultError) throw vaultError;
  return vaults as (Vault & { vault_members: VaultMember[] })[];
}

export async function createVault(name: string, targetAmount: number, targetDate?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: vault, error: vaultError } = await supabase
    .from("vaults")
    .insert({
      name,
      target_amount: targetAmount,
      target_date: targetDate || null,
      created_by: user.id,
      current_savings: 0,
    })
    .select()
    .single();

  if (vaultError) throw vaultError;

  // 2. Automatically link the creator as the 'owner'
  const { error: memberError } = await supabase
    .from("vault_members")
    .insert({
      vault_id: vault.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) throw memberError;

  return vault;
}

export async function joinVault(vaultId: string, role: "member" | "child" = "member") {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("vault_members")
    .insert({
      vault_id: vaultId,
      user_id: user.id,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function linkTransactionToVault(
  type: "expense" | "income",
  transactionId: string,
  vaultId: string
) {
  const table = type === "expense" ? "expenses" : "income";

  const { error } = await supabase
    .from(table)
    .update({ vault_id: vaultId })
    .eq("id", transactionId);

  if (error) throw error;

  await recalculateVaultSavings(vaultId);
}

export async function recalculateVaultSavings(vaultId: string) {
  const { data: incomeSum, error: incError } = await supabase
    .from("income")
    .select("amount")
    .eq("vault_id", vaultId);

  const { data: expenseSum, error: expError } = await supabase
    .from("expenses")
    .select("amount")
    .eq("vault_id", vaultId);

  if (incError || expError) throw new Error("Failed to calculate family balances");

  const totalIncome = incomeSum?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalExpenses = expenseSum?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

  const currentSavings = Math.max(0, totalIncome - totalExpenses);

  const { error: updateError } = await supabase
    .from("vaults")
    .update({ current_savings: currentSavings })
    .eq("id", vaultId);

  if (updateError) throw updateError;
  return currentSavings;
}
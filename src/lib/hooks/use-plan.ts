"use client";

import useSWR from "swr";
import { useAuth } from "@/components/providers/auth-provider";
import {
  FREE_LIMIT,
  PREMIUM_LIMIT,
  getSubscription,
  isPremiumFrom,
} from "@/lib/api/subscription";

export function usePlan() {
  const { user } = useAuth();
  const key = user ? (["subscription", user.id] as const) : null;
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    getSubscription(user!.id),
  );
  const subscription = data ?? null;
  const isPremium = isPremiumFrom(subscription);
  return {
    subscription,
    isPremium,
    habitLimit: isPremium ? PREMIUM_LIMIT : FREE_LIMIT,
    isLoading,
    error,
    mutate,
  };
}

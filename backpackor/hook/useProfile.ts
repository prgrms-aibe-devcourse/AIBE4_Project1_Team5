"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

interface UserProfile {
  display_name: string | null;
  profile_image: string | null;
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const DEFAULT_PROFILE_URL =
    "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png";

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profile")
          .select("display_name, profile_image")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        setProfile({
          display_name: data?.display_name ?? null,
          profile_image: data?.profile_image ?? DEFAULT_PROFILE_URL,
        });
      } catch (err) {
        console.error("user_profile 조회 실패:", err);
        setProfile({
          display_name: null,
          profile_image: DEFAULT_PROFILE_URL,
        });
      }
    };

    fetchProfile();
  }, [userId]);

  const profileUrl = profile?.profile_image ?? DEFAULT_PROFILE_URL;

  return { profile, profileUrl };
}

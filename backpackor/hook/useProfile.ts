"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export type UserProfile = {
  display_name: string | null;
  profile_image: string | null;
};

const FALLBACK_PROFILE =
  "https://rlnpoyrapczrsgmxtlrr.supabase.co/storage/v1/object/public/logo/profile/base.png";

export function useProfile(userId?: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileUrl, setProfileUrl] = useState<string>(FALLBACK_PROFILE);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileUrl(FALLBACK_PROFILE);
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profile")
          .select("display_name, profile_image")
          .eq("user_id", userId)
          .single();

        if (cancelled) return;

        if (error) {
          console.error("프로필 불러오기 실패:", error);
          setProfile(null);
          setProfileUrl(FALLBACK_PROFILE);
        } else if (data) {
          setProfile(data);
          setProfileUrl(data.profile_image ?? FALLBACK_PROFILE);
        }
      } catch {}
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, profileUrl };
}

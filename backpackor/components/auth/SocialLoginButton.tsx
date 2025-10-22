// 소셜 로그인 버튼 컴포넌트
import type { SocialProvider } from "@/types/auth";
import Image from "next/image";

interface SocialLoginButtonProps {
  provider: SocialProvider;
  logoUrl: string;
  onLogin: (provider: SocialProvider) => void;
}

export const SocialLoginButton = ({
  provider,
  logoUrl,
  onLogin,
}: SocialLoginButtonProps) => {
  const providerNames: Record<SocialProvider, string> = {
    google: "Google",
    kakao: "Kakao",
    github: "GitHub",
  };

  return (
    <button
      type="button"
      onClick={() => onLogin(provider)}
      className="w-24 h-24 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:scale-110 transition-transform shadow-md"
      aria-label={`${providerNames[provider]} 로그인`}
    >
        <Image
            src={logoUrl}
            alt={`${providerNames[provider]} logo`}
            width={64}
            height={64}
            className={`object-contain ${provider === "github" ? "rounded-full" : ""}`}
        />
    </button>
  );
};

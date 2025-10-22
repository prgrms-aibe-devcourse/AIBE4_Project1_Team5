// 소셜 로그인 버튼 컴포넌트
import type { SocialProvider } from "@/types/auth";

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

  // GitHub는 object-cover + rounded-full, 나머지는 object-contain
  const imageClassName = provider === "github"
    ? "w-16 h-16 object-cover rounded-full"
    : "w-16 h-16 object-contain";

  return (
    <button
      type="button"
      onClick={() => onLogin(provider)}
      className="w-24 h-24 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:scale-110 transition-transform shadow-md"
      aria-label={`${providerNames[provider]} 로그인`}
    >
      <img
        src={logoUrl}
        alt={`${providerNames[provider]} logo`}
        className={imageClassName}
      />
    </button>
  );
};

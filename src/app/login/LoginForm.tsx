"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Email sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-black to-purple-900/10" />
      
      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <svg
            width="80"
            height="51"
            viewBox="0 0 62.7 38.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              transform="matrix(0.1797 -0.9837 0.9837 0.1797 -25.2876 32.4364)"
              fill="#4E55FF"
              cx="6.8"
              cy="31.4"
              rx="6.9"
              ry="6.8"
            />
            <path
              fill="#4E55FF"
              d="M11.8,1l-1.3,0.6c-0.1,0.1-0.3,0.2-0.4,0.3C10,2,10,2.2,9.9,2.3c0,0.1-0.1,0.3-0.1,0.4c0,0.2,0,0.3,0.1,0.4
              L24,32.5c0.6,1.2,1.3,2.2,2.3,3s2.1,1.5,3.2,1.9s2.5,0.6,3.7,0.5s2.5-0.4,3.6-1l1.3-0.6c0.1-0.1,0.3-0.2,0.4-0.3s0.2-0.2,0.2-0.4
              s0.1-0.3,0.1-0.4s0-0.3-0.1-0.4L24.7,5.5c-0.6-1.2-1.3-2.2-2.3-3S20.3,1,19.2,0.5C18,0.1,16.7-0.1,15.4,0C14.2,0.1,12.9,0.4,11.8,1z"
            />
            <path
              fill="#4E55FF"
              d="M35.6,1l-1.3,0.6C34,1.8,33.8,2,33.7,2.3s-0.1,0.6,0.1,0.9l14.1,29.3c0.6,1.2,1.3,2.2,2.3,3s2.1,1.5,3.2,1.9
              s2.5,0.6,3.7,0.5s2.5-0.4,3.6-1l1.3-0.6c0.3-0.1,0.5-0.4,0.6-0.7s0.1-0.6-0.1-0.9L48.5,5.5c-0.6-1.2-1.3-2.2-2.3-3S44.2,1,43,0.5
              c-1.2-0.4-2.5-0.6-3.7-0.5C38,0.1,36.7,0.4,35.6,1z"
            />
          </svg>
        </div>

        <div className="bg-[#1C1C1E] rounded-3xl p-8 border border-gray-800 shadow-2xl shadow-primary/5">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Midas'a Hoş Geldin
            </h1>
            <p className="text-gray-400 text-sm">
              Yatırımlarını profesyonelce yönetmeye başla.
            </p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className={cn(
              "w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3.5 rounded-2xl transition-all hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google ile Devam Et
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-xs uppercase">veya</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresin"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-[#2C2C2E] border-0 rounded-2xl py-3.5 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading || !email.trim()}
              className={cn(
                "w-full font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                "bg-primary hover:bg-primary/90 text-white"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap / Üye Ol"
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-[11px] text-gray-500 text-center mt-6 leading-relaxed">
            Devam ederek{" "}
            <a href="#" className="text-primary hover:underline">
              Kullanım Şartları
            </a>{" "}
            ve{" "}
            <a href="#" className="text-primary hover:underline">
              Gizlilik Politikası
            </a>
            'nı kabul etmiş olursun.
          </p>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-500 text-xs mt-6">
          © 2024 Midas. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}

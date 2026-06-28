"use client";

import Image from "next/image";
import { redirectToGoogleLogin } from "@/lib/api/auth";

// Google 소셜 로그인 화면 (피그마 디자인 기반)
export default function LoginCard() {
  // fetch가 아닌 전체 페이지 이동 — OAuth 리다이렉트 흐름 유지
  const handleGoogleLogin = () => {
    redirectToGoogleLogin();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#F8F9FA] to-white px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-[102px] h-[410px] w-[512px] rounded-full bg-[rgba(75,65,225,0.05)] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[307px] w-96 rounded-full bg-[rgba(133,131,131,0.05)] blur-[100px]"
      />

      <section className="relative z-10 w-full max-w-[440px] rounded-xl bg-white px-16 py-16 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <h1 className="text-[40px] leading-[48px] font-normal tracking-[-0.025em] text-black">
            TodoList
          </h1>
          <p className="text-base leading-6 text-[#444748]">
            Organize your thoughts, simply.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-4 rounded-lg border border-[#C4C7C7] bg-white px-6 py-3.5 text-base leading-6 text-[#191C1D] transition-colors hover:bg-[#F8F9FA]"
        >
          <Image
            src="/icons/google.svg"
            alt=""
            width={20}
            height={20}
            aria-hidden
          />
          Continue with Google
        </button>
      </section>
    </div>
  );
}

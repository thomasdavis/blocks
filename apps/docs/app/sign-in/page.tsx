"use client";

import dynamic from "next/dynamic";
import { Nav } from "../components/nav";
import { Footer } from "../components/footer";

const SignInForm = dynamic(
  () => import("./sign-in-form").then((m) => m.SignInForm),
  { ssr: false },
);

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#fafcfa] dark:bg-[#050805] text-[#1e281e] dark:text-[#a0b0a0] font-mono">
      <Nav />
      <main id="main-content" className="relative z-10">
        <div className="container mx-auto px-4 py-24">
          <SignInForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}

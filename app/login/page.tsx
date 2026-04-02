"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = { type: "email" } | { type: "otp"; email: string };

const OTP_LENGTH = 8;

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [step, setStep] = useState<Step>({ type: "email" });
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  async function handleSendCode(formData: FormData) {
    setLoading(true);
    setSendCodeError(null);
    const email = formData.get("email") as string;

    try {
      await signIn("resend-otp", formData);
      setStep({ type: "otp", email });
      setVerifyError(null);
    } catch (err: unknown) {
      setSendCodeError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleEnter(e: React.KeyboardEvent) {
    if (e.key !== "Enter" || loading || otp.length !== OTP_LENGTH) return;
    e.preventDefault();
    void handleVerifyCode();
  }

  async function handleVerifyCode() {
    setLoading(true);
    setVerifyError(null);

    const formData = new FormData();
    formData.set("email", step.type === "otp" ? step.email : "");
    formData.set("code", otp);

    try {
      await signIn("resend-otp", formData);
      router.push("/chat");
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
            <Bot className="h-5 w-5 text-background" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">
              {step.type === "email" ? "Sign in" : "Check your email"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {step.type === "email"
                ? "Enter your email to receive a sign-in code"
                : `We sent a code to ${step.email}`}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {/* Email step */}
          {step.type === "email" && (
            <form action={handleSendCode} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="h-10"
                />
                {sendCodeError && (
                  <p className="text-xs text-destructive">{sendCodeError}</p>
                )}
              </div>

              <Button className="w-full h-10 rounded-lg" disabled={loading}>
                {loading ? "Sending..." : "Send code"}
              </Button>
            </form>
          )}

          {/* OTP step */}
          {step.type === "otp" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Verification code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={OTP_LENGTH}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={otp}
                    onChange={(value) => {
                      if (verifyError) setVerifyError(null);
                      setOtp(value);
                    }}
                    onKeyDown={handleEnter}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                      <InputOTPSlot index={6} />
                      <InputOTPSlot index={7} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {verifyError && (
                  <p className="text-xs text-destructive text-center">
                    {verifyError}
                  </p>
                )}
              </div>

              <Button
                className="w-full h-10 rounded-lg"
                disabled={loading || otp.length !== OTP_LENGTH}
                onClick={handleVerifyCode}
              >
                {loading ? "Verifying..." : "Continue"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 rounded-lg text-sm text-muted-foreground"
                onClick={() => {
                  setOtp("");
                  setSendCodeError(null);
                  setStep({ type: "email" });
                }}
              >
                Use a different email
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

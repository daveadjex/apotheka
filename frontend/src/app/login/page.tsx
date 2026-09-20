"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await login(email, password);

      toast.success("Welcome back", {
        description: "You have been signed in successfully.",
      });

      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in.";

      toast.error("Sign in failed", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 -top-70 h-140 w-225 -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[120px]" />

        <div className="absolute -bottom-62.5 -left-37.5 h-112.5 w-112.5 rounded-full bg-primary/4 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex h-20 items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="Apotheka home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Stethoscope className="h-4.5 w-4.5" />
          </div>

          <span className="text-lg font-semibold tracking-tight">
            Apotheka
          </span>
        </Link>

        <ThemeToggle />
      </header>

      {/* Login area */}
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 pb-16 pt-8 sm:px-8">
        <div className="w-full max-w-md">
          {/* Brand / security intro */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted/40 text-primary shadow-sm">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Welcome back
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Sign in to access your Apotheka pharmacy workspace.
            </p>
          </div>

          {/* Login card */}
          <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/95 shadow-2xl shadow-black/6 backdrop-blur">
            <CardHeader className="border-b border-border/60 px-6 py-5 sm:px-7">
              <CardTitle className="text-base font-semibold">
                Sign in to your account
              </CardTitle>

              <CardDescription className="text-sm">
                Enter your credentials to continue.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 px-6 py-6 sm:px-7">
                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium"
                  >
                    Email address
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@pharmacy.com"
                    disabled={isSubmitting}
                    className="h-11 rounded-lg bg-background"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                  </div>

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="h-11 rounded-lg bg-background pr-11"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      tabIndex={-1}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-1 top-1 h-9 w-9 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="h-11 w-full rounded-lg font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                        aria-hidden="true"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </form>

            {/* Security footer */}
            <div className="border-t border-border/60 bg-muted/20 px-6 py-4 sm:px-7">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>

                <div>
                  <p className="text-xs font-medium">
                    Secure access
                  </p>

                  <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                    Your account access is protected by Apotheka&apos;s
                    authentication and permission controls.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Bottom information */}
          <div className="mt-7 text-center">
            <p className="text-xs text-muted-foreground">
              Authorized pharmacy personnel only.
            </p>

            <p className="mt-2 text-[11px] text-muted-foreground/70">
              © {new Date().getFullYear()} Apotheka
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
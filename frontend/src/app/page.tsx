"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Clock3,
  PackageSearch,
  ScanBarcode,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Activity,
  BarChart3,
  Boxes,
  ClipboardCheck,
  LockKeyhole,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";

const FEATURES = [
  {
    icon: ScanBarcode,
    title: "Point of Sale",
    description:
      "Move from barcode scan to completed transaction in seconds with a checkout experience designed around pharmacy workflows.",
  },
  {
    icon: PackageSearch,
    title: "Smart Inventory",
    description:
      "Track stock, batches, expiry dates, suppliers, and branch-level inventory without losing sight of what matters.",
  },
  {
    icon: Users,
    title: "People & Access",
    description:
      "Give owners, pharmacists, cashiers, and managers exactly the access they need with granular role-based permissions.",
  },
  {
    icon: Stethoscope,
    title: "Clinical Safety",
    description:
      "Deterministic checks for interactions, allergies, and duplicate therapy provide a dependable safety layer for pharmacy teams.",
  },
  {
    icon: BarChart3,
    title: "Business Intelligence",
    description:
      "Turn sales, inventory, and operational data into clear insights that help teams understand what is happening across the business.",
  },
  {
    icon: Brain,
    title: "AI-Assisted Insights",
    description:
      "Forecast demand and surface useful operational insights while keeping clinical decisions firmly in the hands of professionals.",
  },
];

const WORKFLOW = [
  {
    number: "01",
    icon: Boxes,
    title: "Know your inventory",
    description:
      "See stock levels, batches, expiry dates, and low-stock conditions across your pharmacy operations.",
  },
  {
    number: "02",
    icon: ScanBarcode,
    title: "Serve customers faster",
    description:
      "A streamlined POS keeps dispensing and checkout moving without unnecessary clicks or friction.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Operate with confidence",
    description:
      "Every important action is traceable, permissions are controlled, and safety checks remain auditable.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 -top-75 h-150 w-225 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-50 top-150 h-100 w-100 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Stethoscope className="h-4 w-4" />
            </div>

            <span className="text-lg">Apotheka</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Platform
            </a>

            <a
              href="#workflow"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>

            <a
              href="#safety"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Safety
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/dashboard">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/login">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:pb-28 lg:pt-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
              {/* Hero copy */}
              <div>
                <Badge
                  variant="secondary"
                  className="mb-6 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Modern pharmacy operations
                </Badge>

                <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                  Run your pharmacy with{" "}
                  <span className="text-primary">clarity.</span>
                </h1>

                <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  Apotheka brings point of sale, inventory, workforce
                  management, analytics, and clinical safety together in one
                  intelligent pharmacy platform.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="h-12 px-6">
                    <Link href="/login">
                      Get started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 px-6"
                  >
                    <a href="#features">
                      Explore the platform
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Role-based access
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Audit-ready
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Built for pharmacy
                  </div>
                </div>
              </div>

              {/* Product visual */}
              <div className="relative">
                <div className="absolute -inset-8 rounded-[3rem] bg-primary/10 blur-3xl" />

                <Card className="relative overflow-hidden rounded-2xl border-border/70 bg-card/90 shadow-2xl shadow-black/10 backdrop-blur">
                  {/* Mock dashboard top bar */}
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      <span className="text-xs font-medium">
                        Pharmacy overview
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                    </div>
                  </div>

                  <CardContent className="p-5 sm:p-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Today&apos;s sales
                          </span>
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </div>

                        <div className="text-2xl font-semibold tracking-tight">
                          GHS 24.8k
                        </div>

                        <div className="mt-1 text-xs text-primary">
                          +12.4% this week
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Stock health
                          </span>
                          <PackageSearch className="h-4 w-4 text-primary" />
                        </div>

                        <div className="text-2xl font-semibold tracking-tight">
                          94%
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          18 items need attention
                        </div>
                      </div>
                    </div>

                    {/* Activity */}
                    <div className="mt-4 rounded-xl border border-border">
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <span className="text-sm font-medium">
                          Recent activity
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Today
                        </span>
                      </div>

                      <div className="divide-y divide-border">
                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ScanBarcode className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              Prescription completed
                            </p>
                            <p className="text-xs text-muted-foreground">
                              POS · Counter 03
                            </p>
                          </div>

                          <span className="text-xs text-muted-foreground">
                            2m
                          </span>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Clock3 className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              Low-stock alert
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Amoxicillin 500mg
                            </p>
                          </div>

                          <span className="text-xs text-muted-foreground">
                            8m
                          </span>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              Safety check completed
                            </p>
                            <p className="text-xs text-muted-foreground">
                              No interaction detected
                            </p>
                          </div>

                          <span className="text-xs text-muted-foreground">
                            14m
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mini chart */}
                    <div className="mt-4 rounded-xl border border-border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Weekly performance
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sales activity
                          </p>
                        </div>

                        <Activity className="h-4 w-4 text-primary" />
                      </div>

                      <div className="flex h-20 items-end gap-2">
                        {[35, 48, 42, 65, 58, 78, 92, 72, 84, 96, 80, 100].map(
                          (height, index) => (
                            <div
                              key={index}
                              className="flex-1 rounded-t-sm bg-primary/20"
                              style={{ height: `${height}%` }}
                            >
                              <div
                                className="h-full rounded-t-sm bg-primary"
                                style={{
                                  height: `${Math.min(
                                    100,
                                    height + (index % 3) * 5
                                  )}%`,
                                }}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Trust / positioning strip */}
        <section className="border-y border-border bg-muted/20">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border sm:grid-cols-4">
            <div className="px-5 py-7 text-center sm:px-8">
              <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Security-first</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Controlled access
              </p>
            </div>

            <div className="px-5 py-7 text-center sm:px-8">
              <ClipboardCheck className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Audit-ready</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Trace every action
              </p>
            </div>

            <div className="px-5 py-7 text-center sm:px-8">
              <Boxes className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Operations unified</p>
              <p className="mt-1 text-xs text-muted-foreground">
                One platform
              </p>
            </div>

            <div className="px-5 py-7 text-center sm:px-8">
              <LockKeyhole className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">Designed for teams</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Role-aware workflows
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="scroll-mt-20 px-5 py-24 sm:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-5 rounded-full">
                The platform
              </Badge>

              <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                Everything your pharmacy needs.
                <span className="text-muted-foreground">
                  {" "}
                  Nothing buried in unnecessary complexity.
                </span>
              </h2>

              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Apotheka connects the operational systems your team depends on
                every day, giving everyone a clearer picture of the business.
              </p>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(
                ({ icon: Icon, title, description }, index) => (
                  <Card
                    key={title}
                    className={`group relative overflow-hidden border-border/70 bg-card/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl ${
                      index === 0 ? "lg:col-span-1" : ""
                    }`}
                  >
                    <CardHeader className="p-6">
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/50 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>

                      <CardTitle className="text-lg">{title}</CardTitle>

                      <CardDescription className="mt-2 text-sm leading-6">
                        {description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )
              )}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section
          id="workflow"
          className="scroll-mt-20 border-y border-border bg-muted/20 px-5 py-24 sm:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
              <div>
                <Badge variant="outline" className="mb-5 rounded-full">
                  Built around your workflow
                </Badge>

                <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Less friction.
                  <br />
                  More control.
                </h2>

                <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
                  Pharmacy software should support the people using it, not
                  force them to work around the software.
                </p>

                <Button asChild className="mt-8">
                  <Link href="/login">
                    Explore Apotheka
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {WORKFLOW.map(
                  ({ number, icon: Icon, title, description }) => (
                    <div
                      key={number}
                      className="group flex gap-5 rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:border-primary/30 sm:p-6"
                    >
                      <div className="flex shrink-0 flex-col items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="font-mono text-[10px] text-muted-foreground">
                          {number}
                        </span>
                      </div>

                      <div className="pt-1">
                        <h3 className="font-semibold">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Safety */}
        <section
          id="safety"
          className="scroll-mt-20 px-5 py-24 sm:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <Card className="overflow-hidden rounded-3xl border-primary/20 bg-primary/4">
              <CardContent className="p-8 sm:p-12 lg:p-16">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                  <div>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <ShieldCheck className="h-6 w-6" />
                    </div>

                    <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                      Safety should never be a black box.
                    </h2>

                    <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
                      Apotheka&apos;s clinical safety layer is designed around
                      deterministic, explainable rules. Checks can identify
                      potential interactions, allergies, and duplicate therapy
                      while keeping professional judgment where it belongs.
                    </p>

                    <div className="mt-8 space-y-3">
                      {[
                        "Drug interaction checks",
                        "Allergy screening",
                        "Duplicate therapy detection",
                        "Auditable safety events",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Check className="h-3 w-3" />
                          </div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety visual */}
                  <div className="relative">
                    <div className="rounded-2xl border border-border bg-background p-5 shadow-xl">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                          <p className="text-sm font-semibold">
                            Clinical safety check
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Prescription review
                          </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <div className="rounded-xl border border-border p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Drug interactions
                            </span>

                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
                              Clear
                            </Badge>
                          </div>
                        </div>

                        <div className="rounded-xl border border-border p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Allergy screening
                            </span>

                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
                              Clear
                            </Badge>
                          </div>
                        </div>

                        <div className="rounded-xl border border-border p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Duplicate therapy
                            </span>

                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
                              Clear
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                        <LockKeyhole className="h-3.5 w-3.5" />
                        Review recorded in audit trail
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AI section */}
        <section className="border-t border-border px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="rounded-3xl border border-border bg-muted/20 p-6 sm:p-8">
                  <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Brain className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Inventory intelligence
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Forecasting & operational insight
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Expected demand
                          </span>
                          <span className="font-medium">High</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full w-[82%] rounded-full bg-primary" />
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Stock coverage
                          </span>
                          <span className="font-medium">18 days</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full w-[64%] rounded-full bg-primary/60" />
                        </div>
                      </div>

                      <div className="rounded-xl bg-primary/5 p-4">
                        <div className="flex gap-3">
                          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <p className="text-xs leading-5 text-muted-foreground">
                            Demand patterns indicate increased movement over
                            the next two weeks. Review replenishment levels.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <Badge variant="outline" className="mb-5 rounded-full">
                  Intelligence without the hype
                </Badge>

                <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                  Use AI where it actually helps.
                </h2>

                <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
                  Apotheka uses AI to help teams understand patterns,
                  forecast inventory needs, and surface useful operational
                  information — while keeping clinical decisions with
                  qualified professionals.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <Brain className="mb-3 h-5 w-5 text-primary" />
                    <p className="text-sm font-medium">Demand forecasting</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Anticipate inventory movement.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border p-4">
                    <BarChart3 className="mb-3 h-5 w-5 text-primary" />
                    <p className="text-sm font-medium">Business insights</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Understand operational trends.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 pb-24 pt-10 sm:px-8 lg:pb-32">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-7 py-16 text-center text-primary-foreground sm:px-12 lg:py-20">
              <div className="absolute left-1/2 -top-37.5 h-87.5 w-150 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <p className="text-sm font-medium text-primary-foreground/70">
                  The modern pharmacy operating system
                </p>

                <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                  Give your pharmacy a system built for the work.
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-primary-foreground/75">
                  Bring your operations, inventory, people, sales, and safety
                  workflows into one connected platform.
                </p>

                <div className="mt-8">
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="h-12 px-7"
                  >
                    <Link href="/login">
                      Get started with Apotheka
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-3.5 w-3.5" />
            </div>

            <span className="text-sm font-semibold">Apotheka</span>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Apotheka. Built for pharmacies, not
            around them.
          </p>

          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>

            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Platform
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
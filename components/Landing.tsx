"use client"

import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  ArrowRight,
  Sparkles,
  DollarSign,
  TrendingDown,
  Clock,
  ShoppingBag,
  Search,
  Zap,
  CheckCircle2,
} from "lucide-react"

// ============================================
// CONFIGURATION - Easy to modify
// ============================================

const CONTENT = {
  branding: {
    name: "SmartCart",
    tagline: "Built for UC Irvine Students",
  },
  hero: {
    title: "Smart Grocery Shopping",
    titleHighlight: "Made Simple",
    subtitle:
      "Get personalized grocery recommendations, budget-friendly meal plans, and store comparisons—all tailored for college students.",
    stats: [
      { value: "$50+", label: "Average monthly savings" },
      { value: "500+", label: "UCI students using SmartCart" },
      { value: "3 min", label: "Average time to find best deals" },
    ],
  },
  features: [
    {
      icon: DollarSign,
      title: "Budget Tracking",
      description:
        "Stay within your grocery budget with smart spending insights and price alerts for your favorite items.",
    },
    {
      icon: TrendingDown,
      title: "Price Comparison",
      description: "Compare prices across Trader Joe's, Ralphs, and Target to find the best deals near campus.",
    },
    {
      icon: Clock,
      title: "Meal Planning",
      description: "Get quick, healthy meal ideas that fit your schedule and budget—perfect for busy students.",
    },
    {
      icon: ShoppingBag,
      title: "Smart Lists",
      description: "Generate shopping lists based on recipes, dietary needs, and what's on sale this week.",
    },
  ],
  howItWorks: [
    {
      icon: Search,
      number: "01",
      title: "Tell Us What You Need",
      description: "Enter your dietary preferences, budget, and what you're craving this week.",
    },
    {
      icon: Zap,
      number: "02",
      title: "Get Smart Recommendations",
      description: "Our AI analyzes prices, nutrition, and reviews to suggest the best options.",
    },
    {
      icon: CheckCircle2,
      number: "03",
      title: "Shop & Save",
      description: "Follow your optimized shopping list and save time and money on every trip.",
    },
  ],
  cta: {
    title: "Ready to Save on Groceries?",
    subtitle: "Join hundreds of UCI students who are already shopping smarter and saving money every week.",
    disclaimer: "No credit card required • Takes less than 2 minutes",
  },
}

// ============================================
// COMPONENTS
// ============================================

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">{CONTENT.branding.name}</span>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </a>
          <Button size="sm" className="ml-2">
            Get Started
          </Button>
        </nav>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-20 sm:py-28 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>{CONTENT.branding.tagline}</span>
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            {CONTENT.hero.title} <span className="text-primary">{CONTENT.hero.titleHighlight}</span>
          </h1>

          <p className="mb-10 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
            {CONTENT.hero.subtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group h-12 gap-2 px-6 text-base">
              Start Shopping Smarter
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6 text-base bg-transparent">
              See How It Works
            </Button>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {CONTENT.hero.stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border/50 bg-card p-6">
                <div className="mb-2 text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border/40 py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Everything You Need to Shop Smarter
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Powerful tools designed specifically for college students who want to eat well without breaking the bank.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {CONTENT.features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-border/40 bg-muted/30 py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            How {CONTENT.branding.name} Works
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Three simple steps to revolutionize your grocery shopping experience.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-3">
            {CONTENT.howItWorks.map((step, index) => (
              <div key={step.number} className="relative">
                {index < CONTENT.howItWorks.length - 1 && (
                  <div className="absolute left-1/2 top-16 hidden h-px w-full bg-border md:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-background">
                    <step.icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="mb-2 text-sm font-mono font-semibold text-primary">{step.number}</div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-8 text-center sm:p-12 md:p-16">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {CONTENT.cta.title}
          </h2>
          <p className="mb-8 text-pretty text-lg leading-relaxed text-muted-foreground">{CONTENT.cta.subtitle}</p>
          <Button size="lg" className="group h-12 gap-2 px-8 text-base">
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">{CONTENT.cta.disclaimer}</p>
        </div>
      </div>
    </section>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
    </div>
  )
}

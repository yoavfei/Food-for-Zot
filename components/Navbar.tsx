"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation';
import { ShoppingCart } from "lucide-react"

function Navbar() {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">{"Food for Zot"}</span>
                </div>
                <nav className="hidden items-center gap-6 md:flex">
                    <a
                        href="#features"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Features
                    </a>
                    <Link
                        href="/search"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground ml-2"
                    >
                        Search
                    </Link>
                    <Button size="sm" className="ml-2" onClick={() => router.push('/login')}>
                        Get Started
                    </Button>
                </nav>
            </div>
        </header>
    )
}

export default Navbar;
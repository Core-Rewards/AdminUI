import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import {
    Announcement01,
    CoinsStacked01,
    HomeLine,
    LifeBuoy01,
    PieChart03,
    Settings01,
    Users01,
} from "@untitledui/icons";
import { AiChatMobileTrigger, AiChatSidebar, AiChatTrigger } from "@/components/application/ai-chat-sidebar";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { SidebarNavigationSimple } from "@/components/application/app-navigation/sidebar-navigation/sidebar-simple";

const navItems: NavItemType[] = [
    { label: "Home", icon: HomeLine, href: "/dashboard" },
    { label: "Home Two", icon: HomeLine, href: "/dashboard/home-two" },
    { label: "Participants", icon: Users01, href: "/dashboard/participants" },
    { label: "Issue Points", icon: CoinsStacked01, href: "/dashboard/issue-points" },
    { label: "Promotions", icon: Announcement01, href: "/dashboard/promotions" },
    { label: "Reporting", icon: PieChart03, href: "/dashboard/reporting" },
];

const footerItems: NavItemType[] = [
    { label: "Support", icon: LifeBuoy01, href: "/dashboard/support" },
    { label: "Settings", icon: Settings01, href: "/dashboard/settings" },
];

const AI_DRAWER_STORAGE_KEY = "ai-assistant-drawer-open";

export const DashboardLayout = () => {
    const location = useLocation();
    const isHomeTwo = location.pathname.startsWith("/dashboard/home-two");

    // Open by default; remember the user's choice across navigations and reloads.
    const [isAiOpen, setIsAiOpen] = useState(() => {
        if (typeof window === "undefined") return true;
        return window.localStorage.getItem(AI_DRAWER_STORAGE_KEY) !== "false";
    });

    useEffect(() => {
        window.localStorage.setItem(AI_DRAWER_STORAGE_KEY, String(isAiOpen));
    }, [isAiOpen]);

    return (
        <div className="relative flex min-h-dvh flex-col lg:flex-row">
            {/* Mobile AI chat trigger — hidden on Home Two which has inline chat */}
            {!isHomeTwo && (
                <div className="absolute top-1.5 right-12 z-10 lg:hidden">
                    <AiChatMobileTrigger />
                </div>
            )}

            <SidebarNavigationSimple activeUrl={location.pathname} items={navItems} footerItems={footerItems} className="bg-[oklch(98.5%_0.001_106.423)]" />

            <main className="relative flex min-w-0 flex-1 flex-col">
                {/* Zero-height sticky rail keeps the trigger pinned to the top-right of the content column. */}
                {!isHomeTwo && (
                    <div className="pointer-events-none sticky top-0 z-20 flex h-0 items-start justify-end px-4 pt-4 max-lg:hidden">
                        <AiChatTrigger isOpen={isAiOpen} onPress={() => setIsAiOpen((open) => !open)} className="pointer-events-auto" />
                    </div>
                )}

                <Outlet />
            </main>

            {!isHomeTwo && <AiChatSidebar isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} className="max-lg:hidden" />}
        </div>
    );
};

export const DashboardHome = () => {
    return (
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
            <div>
                <h1 className="text-display-xs font-semibold text-primary">Dashboard</h1>
                <p className="mt-1 text-sm text-tertiary">Welcome back. Here's an overview of your workspace.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard label="Total projects" value="12" />
                <MetricCard label="Active tasks" value="38" />
                <MetricCard label="Team members" value="6" />
            </div>

            <div className="flex-1 rounded-xl border border-secondary bg-primary p-6">
                <p className="text-sm text-tertiary">Content area — ready for your components.</p>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-secondary bg-primary p-5">
        <p className="text-sm font-medium text-tertiary">{label}</p>
        <p className="mt-2 text-display-sm font-semibold text-primary">{value}</p>
    </div>
);

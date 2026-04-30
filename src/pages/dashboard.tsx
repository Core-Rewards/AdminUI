import { Outlet, useLocation } from "react-router";
import {
    CoinsStacked01,
    HomeLine,
    LifeBuoy01,
    PieChart03,
    Settings01,
    Users01,
} from "@untitledui/icons";
import { AiChatMobileTrigger, AiChatSidebar } from "@/components/application/ai-chat-sidebar";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { SidebarNavigationSimple } from "@/components/application/app-navigation/sidebar-navigation/sidebar-simple";

const navItems: NavItemType[] = [
    { label: "Home", icon: HomeLine, href: "/dashboard" },
    { label: "Home Two", icon: HomeLine, href: "/dashboard/home-two" },
    { label: "Participants", icon: Users01, href: "/dashboard/participants" },
    { label: "Issue Points", icon: CoinsStacked01, href: "/dashboard/issue-points" },
    { label: "Reporting", icon: PieChart03, href: "/dashboard/reporting" },
];

const footerItems: NavItemType[] = [
    { label: "Support", icon: LifeBuoy01, href: "/dashboard/support" },
    { label: "Settings", icon: Settings01, href: "/dashboard/settings" },
];

export const DashboardLayout = () => {
    const location = useLocation();
    const isHomeTwo = location.pathname.startsWith("/dashboard/home-two");

    return (
        <div className="relative flex min-h-dvh flex-col lg:flex-row">
            {/* Mobile AI chat trigger — hidden on Home Two which has inline chat */}
            {!isHomeTwo && (
                <div className="absolute top-1.5 right-12 z-10 lg:hidden">
                    <AiChatMobileTrigger />
                </div>
            )}

            <SidebarNavigationSimple activeUrl={location.pathname} items={navItems} footerItems={footerItems} className="bg-[oklch(98.5%_0.001_106.423)]" />

            <main className="flex min-w-0 flex-1 flex-col">
                <Outlet />
            </main>

            {!isHomeTwo && <AiChatSidebar className="max-lg:hidden" />}
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

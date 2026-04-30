import { type Key, useMemo, useState } from "react";
import {
    ArrowRight,
    BarChart01,
    Calendar,
    Clock,
    CoinsStacked01,
    FilterLines,
    SearchLg,
    ShoppingCart01,
    Star01,
    Users01,
} from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import type { SelectItemType } from "@/components/base/select/select";
import { Select } from "@/components/base/select/select";
import { cx } from "@/utils/cx";

// ─── Types ───────────────────────────────────────────────────

type Category = "all" | "issuance" | "redemptions" | "participants" | "billing";

interface Report {
    id: string;
    name: string;
    description: string;
    category: Exclude<Category, "all">;
    lastRun?: string;
}

// ─── Data ────────────────────────────────────────────────────

const reports: Report[] = [
    { id: "all-participants", name: "All Participants", description: "Complete list of all platform participants with roles, status, and program assignments.", category: "participants", lastRun: "Apr 22, 2026" },
    { id: "platform-orders", name: "Platform Orders", description: "Detailed breakdown of all orders placed through the rewards platform.", category: "billing", lastRun: "Apr 21, 2026" },
    { id: "issuance", name: "Issuance", description: "Summary of all points and dollar rewards issued to participants over time.", category: "issuance", lastRun: "Apr 20, 2026" },
    { id: "redemptions", name: "Redemptions", description: "All participant reward redemptions including item, value, and fulfillment status.", category: "redemptions", lastRun: "Apr 19, 2026" },
    { id: "reward-codes", name: "Reward Codes", description: "Generated reward codes with allocation status, expiry dates, and usage tracking.", category: "issuance" },
    { id: "platform-logins", name: "Platform Logins", description: "Login activity across the platform including timestamps, locations, and devices.", category: "participants", lastRun: "Apr 18, 2026" },
    { id: "billing-summary", name: "Billing Summary", description: "Monthly billing totals, payment history, and outstanding invoices.", category: "billing" },
    { id: "redemption-trends", name: "Redemption Trends", description: "Trends and patterns in reward redemptions by category, region, and time period.", category: "redemptions", lastRun: "Apr 17, 2026" },
];

const cadenceItems: SelectItemType[] = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "biweekly", label: "Every 2 weeks" },
    { id: "monthly", label: "Monthly" },
    { id: "quarterly", label: "Quarterly" },
];

const categoryLabels: Record<Exclude<Category, "all">, string> = {
    issuance: "Issuance",
    redemptions: "Redemptions",
    participants: "Participants",
    billing: "Billing",
};

const categoryColors: Record<Exclude<Category, "all">, "brand" | "success" | "blue" | "orange"> = {
    issuance: "brand",
    redemptions: "success",
    participants: "blue",
    billing: "orange",
};

const filterCategoryItems: SelectItemType[] = [
    { id: "all", label: "All Categories" },
    { id: "issuance", label: "Issuance" },
    { id: "redemptions", label: "Redemptions" },
    { id: "participants", label: "Participants" },
    { id: "billing", label: "Billing" },
];

// ─── Schedule Modal ──────────────────────────────────────────

const ScheduleModal = ({
    report,
    isOpen,
    onOpenChange,
}: {
    report: Report | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    const [cadence, setCadence] = useState<string>("weekly");
    const [email, setEmail] = useState("");

    if (!report) return null;

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal className="max-w-lg">
                <Dialog className="w-full">
                    <div className="w-full rounded-xl bg-primary shadow-xl ring-1 ring-secondary">
                        <div className="border-b border-secondary px-6 pt-6 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-brand-secondary">
                                    <Calendar className="size-5 text-fg-brand-primary" />
                                </div>
                                <div>
                                    <h2 className="text-md font-semibold text-primary">Schedule Report</h2>
                                    <p className="text-sm text-tertiary">
                                        Auto-send <span className="font-medium text-secondary">{report.name}</span> on a recurring cadence.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 px-6 py-5">
                            <Select
                                label="Cadence"
                                items={cadenceItems}
                                selectedKey={cadence}
                                onSelectionChange={(key) => setCadence(key as string)}
                                size="md"
                                icon={Clock}
                            >
                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                            </Select>
                            <Input
                                label="Send to"
                                placeholder="email@company.com"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                hint="Separate multiple emails with commas."
                                size="md"
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
                            <Button color="secondary" size="md" onPress={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button color="primary" size="md" iconLeading={Calendar}>
                                Schedule
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};

// ─── Page ────────────────────────────────────────────────────

export const ReportingPage = () => {
    const [favorites, setFavorites] = useState<Set<string>>(new Set(["all-participants", "issuance"]));
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<Key>("all");
    const [scheduleReport, setScheduleReport] = useState<Report | null>(null);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSchedule = (report: Report) => {
        setScheduleReport(report);
        setScheduleModalOpen(true);
    };

    const filteredReports = useMemo(() => {
        const filtered = reports.filter((r) => {
            const matchesSearch =
                !search ||
                r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        // Sort: favorites first, then alphabetical
        return [...filtered].sort((a, b) => {
            const aFav = favorites.has(a.id) ? 0 : 1;
            const bFav = favorites.has(b.id) ? 0 : 1;
            if (aFav !== bFav) return aFav - bFav;
            return a.name.localeCompare(b.name);
        });
    }, [search, categoryFilter, favorites]);

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
            {/* Header */}
            <div>
                <h1 className="text-display-xs font-semibold text-primary">Reporting</h1>
                <p className="mt-1 text-sm text-tertiary">View, download, and schedule reports.</p>
            </div>

            {/* Recommended Reports */}
            <div>
                <h2 className="mb-3 text-sm font-semibold text-primary">Recommended Reports</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <RecommendedCard
                        icon={CoinsStacked01}
                        title="Issuance Summary"
                        description="Points and dollar rewards issued across all programs this month."
                        color="brand"
                    />
                    <RecommendedCard
                        icon={ShoppingCart01}
                        title="Redemption Trends"
                        description="Trends and patterns in reward redemptions by category and region."
                        color="success"
                    />
                    <RecommendedCard
                        icon={Users01}
                        title="Active Participants"
                        description="Participant engagement and activity levels across all programs."
                        color="blue"
                    />
                </div>
            </div>

            {/* Table */}
            <TableCard.Root>
                <TableCard.Header
                    title="Reports"
                    badge={<Badge type="pill-color" size="sm" color="gray">{filteredReports.length}</Badge>}
                    contentTrailing={
                        <div className="flex items-center gap-3">
                            <Input
                                aria-label="Search reports"
                                placeholder="Search reports..."
                                icon={SearchLg}
                                size="sm"
                                value={search}
                                onChange={setSearch}
                            />
                            <Select
                                aria-label="Filter by category"
                                items={filterCategoryItems}
                                selectedKey={categoryFilter}
                                onSelectionChange={setCategoryFilter}
                                size="sm"
                                icon={FilterLines}
                            >
                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                            </Select>
                        </div>
                    }
                />
                <Table size="md">
                    <Table.Header>
                        <Table.Head id="favorite" className="w-12"><span className="sr-only">Favorite</span></Table.Head>
                        <Table.Head id="name" isRowHeader>Report</Table.Head>
                        <Table.Head id="category">Category</Table.Head>
                        <Table.Head id="actions" className="w-52"><span className="sr-only">Actions</span></Table.Head>
                    </Table.Header>
                    <Table.Body items={filteredReports} renderEmptyState={() => (
                        <div className="py-10 text-center">
                            <BarChart01 className="mx-auto size-6 text-fg-quaternary" />
                            <p className="mt-2 text-sm font-medium text-primary">No reports found</p>
                            <p className="mt-1 text-sm text-tertiary">Try adjusting your search or filter.</p>
                        </div>
                    )}>
                        {(row) => {
                            const isFav = favorites.has(row.id);

                            return (
                                <Table.Row key={row.id} id={row.id}>
                                    <Table.Cell>
                                        <button
                                            type="button"
                                            onClick={() => toggleFavorite(row.id)}
                                            className={cx(
                                                "flex size-8 cursor-pointer items-center justify-center rounded-md transition duration-100 ease-linear",
                                                isFav
                                                    ? "text-warning-primary"
                                                    : "text-fg-quaternary hover:text-fg-quaternary_hover",
                                            )}
                                            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            <Star01 className={cx("size-4", isFav && "fill-current")} />
                                        </button>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-primary">{row.name}</p>
                                            <p className="truncate text-xs text-tertiary">{row.description}</p>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Badge type="pill-color" size="sm" color={categoryColors[row.category]}>
                                            {categoryLabels[row.category]}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex gap-2">
                                            <Button size="sm" color="secondary">
                                                View
                                            </Button>
                                            <Button size="sm" color="secondary" iconLeading={Calendar} onPress={() => handleSchedule(row)}>
                                                Schedule
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        }}
                    </Table.Body>
                </Table>
            </TableCard.Root>

            {/* Schedule modal */}
            <ScheduleModal
                report={scheduleReport}
                isOpen={scheduleModalOpen}
                onOpenChange={setScheduleModalOpen}
            />
        </div>
    );
};

const recommendedColors = {
    brand: "bg-brand-secondary text-fg-brand-primary",
    success: "bg-success-secondary text-fg-success-primary",
    blue: "bg-[color:var(--color-utility-blue-50)] text-[color:var(--color-utility-blue-600)]",
};

const RecommendedCard = ({
    icon: Icon,
    title,
    description,
    color,
}: {
    icon: React.FC<{ className?: string }>;
    title: string;
    description: string;
    color: "brand" | "success" | "blue";
}) => (
    <button
        type="button"
        className="group flex cursor-pointer flex-col rounded-xl border border-secondary bg-primary p-5 text-left transition duration-100 ease-linear hover:bg-primary_hover"
    >
        <div className={cx("mb-4 flex size-10 items-center justify-center rounded-full", recommendedColors[color])}>
            <Icon className="size-5" />
        </div>
        <p className="text-sm font-semibold text-primary">{title}</p>
        <p className="mt-1 text-sm text-tertiary">{description}</p>
        <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-secondary transition duration-100 ease-linear group-hover:text-brand-secondary_hover">
            View report
            <ArrowRight className="size-4" />
        </div>
    </button>
);

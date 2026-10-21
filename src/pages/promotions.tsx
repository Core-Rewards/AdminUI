import type { FC, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
    Calendar,
    Check,
    CheckCircle,
    CoinsStacked01,
    HelpCircle,
    InfoCircle,
    Send01,
    Tag01,
    TrendUp01,
    TrendUp02,
} from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import type { SelectItemType } from "@/components/base/select/select";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";

// ─── Mock data ───────────────────────────────────────────────

const members: SelectItemType[] = [
    { id: "am-industrial", label: "A & M Industrial" },
    { id: "border-states", label: "Border States Electric" },
    { id: "crescent", label: "Crescent Electric Supply" },
    { id: "turtle-hughes", label: "Turtle & Hughes" },
    { id: "van-meter", label: "Van Meter Inc." },
];

const suppliers: SelectItemType[] = [
    { id: "milwaukee", label: "Milwaukee Tool - Industrial" },
    { id: "3m", label: "3M" },
    { id: "dewalt", label: "DeWalt" },
    { id: "klein", label: "Klein Tools" },
    { id: "fluke", label: "Fluke" },
    { id: "brady", label: "Brady Corporation" },
];

// ─── Promotion types ─────────────────────────────────────────

type PromotionTypeId = "bonus-all" | "bonus-select" | "growth-all" | "growth-select" | "ad-live-event" | "question-week";

interface PromotionType {
    id: PromotionTypeId;
    label: string;
    icon: FC<{ className?: string }>;
    description: string;
    needsMultiplier?: boolean;
    needsProducts?: boolean;
    needsEventName?: boolean;
}

const promotionTypes: PromotionType[] = [
    {
        id: "bonus-all",
        label: "Bonus Points on All Products",
        icon: CoinsStacked01,
        description: "Participants earn multiplied points on every product from the supplier during the promotion.",
        needsMultiplier: true,
    },
    {
        id: "bonus-select",
        label: "Bonus Points on Select Products",
        icon: Tag01,
        description: "Multiplied points on a specific list of products or SKUs that you choose.",
        needsMultiplier: true,
        needsProducts: true,
    },
    {
        id: "growth-all",
        label: "Growth Promotion on All Products",
        icon: TrendUp01,
        description: "Reward purchase growth over a baseline across the supplier's full catalog.",
    },
    {
        id: "growth-select",
        label: "Growth Promotion on Select Products",
        icon: TrendUp02,
        description: "Reward purchase growth on a specific product category or SKU list.",
        needsProducts: true,
    },
    {
        id: "ad-live-event",
        label: "AD Live Event",
        icon: Calendar,
        description: "Bonus points for orders placed with the supplier during an AD Live event.",
        needsEventName: true,
    },
    {
        id: "question-week",
        label: "Question of the Week",
        icon: HelpCircle,
        description: "Participants earn points for correctly answering a weekly question about the supplier.",
    },
];

const multiplierOptions = ["2x", "3x", "5x", "10x"] as const;
type Multiplier = (typeof multiplierOptions)[number];

const isGrowthType = (id: PromotionTypeId) => id === "growth-all" || id === "growth-select";

// ─── Requests table ──────────────────────────────────────────

type RequestStatus = "pending" | "approved" | "live" | "ended" | "declined";

interface RequestRow {
    id: string;
    promotion: string;
    supplier: string;
    type: string;
    dates: string;
    status: RequestStatus;
    submitted: string;
    reviewed: string;
}

const initialRequests: RequestRow[] = [
    {
        id: "1",
        promotion: "Milwaukee Heavy Duty Days",
        supplier: "Milwaukee Tool - Industrial",
        type: "Bonus Points on Select Products · 3x",
        dates: "8/1/2026 - 8/15/2026",
        status: "pending",
        submitted: "7/12/2026",
        reviewed: "—",
    },
    {
        id: "2",
        promotion: "Summer Safety Growth Push",
        supplier: "3M",
        type: "Growth Promotion on All Products",
        dates: "7/1/2026 - 9/30/2026",
        status: "live",
        submitted: "6/20/2026",
        reviewed: "6/24/2026",
    },
    {
        id: "3",
        promotion: "Test promotion - member",
        supplier: "3M",
        type: "Bonus Points on All Products · 2x",
        dates: "7/5/2026 - 7/31/2026",
        status: "approved",
        submitted: "7/4/2026",
        reviewed: "7/4/2026",
    },
    {
        id: "4",
        promotion: "Klein Hand Tools Trivia",
        supplier: "Klein Tools",
        type: "Question of the Week",
        dates: "6/1/2026 - 6/26/2026",
        status: "ended",
        submitted: "5/18/2026",
        reviewed: "5/20/2026",
    },
    {
        id: "5",
        promotion: "DeWalt 10x Flash Promo",
        supplier: "DeWalt",
        type: "Bonus Points on All Products · 10x",
        dates: "7/20/2026 - 7/22/2026",
        status: "declined",
        submitted: "7/10/2026",
        reviewed: "7/13/2026",
    },
];

const statusFilterItems: SelectItemType[] = [
    { id: "all", label: "All statuses" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "live", label: "Live" },
    { id: "ended", label: "Ended" },
    { id: "declined", label: "Declined" },
];

const StatusBadge = ({ status }: { status: RequestStatus }) => {
    const config = {
        pending: { color: "warning" as const, label: "Pending" },
        approved: { color: "success" as const, label: "Approved" },
        live: { color: "brand" as const, label: "Live" },
        ended: { color: "gray" as const, label: "Ended" },
        declined: { color: "error" as const, label: "Declined" },
    }[status];

    return (
        <Badge type="pill-color" size="sm" color={config.color}>
            {config.label}
        </Badge>
    );
};

// ─── Date helpers ────────────────────────────────────────────

const MIN_LEAD_DAYS = 5;

const toISODate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const earliestStartISO = () => {
    const date = new Date();
    date.setDate(date.getDate() + MIN_LEAD_DAYS);
    return toISODate(date);
};

const formatISODate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-US");

// ─── Guided step section ─────────────────────────────────────

type StepState = "complete" | "active" | "locked";

const StepSection = ({
    step,
    title,
    description,
    state,
    isLast,
    children,
}: {
    step: number;
    title: string;
    description: string;
    state: StepState;
    isLast?: boolean;
    children: ReactNode;
}) => (
    <div className="flex gap-4">
        {/* Step indicator + connector line */}
        <div className="flex flex-col items-center">
            <div
                className={cx(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition duration-100 ease-linear",
                    state === "complete" && "bg-brand-solid text-white",
                    state === "active" && "bg-brand-secondary text-brand-primary ring-1 ring-brand ring-inset",
                    state === "locked" && "bg-secondary text-quaternary",
                )}
            >
                {state === "complete" ? <Check className="size-4" aria-hidden="true" /> : step}
            </div>
            {!isLast && <div className={cx("w-px flex-1", state === "complete" ? "bg-brand-solid" : "bg-border-secondary")} />}
        </div>

        {/* Step content */}
        <div className={cx("min-w-0 flex-1", !isLast && "pb-8")}>
            <h3 className={cx("pt-1 text-md font-semibold", state === "locked" ? "text-quaternary" : "text-primary")}>{title}</h3>
            <p className={cx("mt-0.5 text-sm", state === "locked" ? "text-quaternary" : "text-tertiary")}>{description}</p>
            {state !== "locked" && <div className="mt-4">{children}</div>}
        </div>
    </div>
);

// ─── Review row ──────────────────────────────────────────────

const ReviewRow = ({ label, value }: { label: string; value: ReactNode }) => (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4">
        <dt className="w-48 shrink-0 text-sm font-medium text-secondary">{label}</dt>
        <dd className="min-w-0 text-sm text-tertiary">{value}</dd>
    </div>
);

// ─── Page ────────────────────────────────────────────────────

export const PromotionsPage = () => {
    // Step 1 — who
    const [member, setMember] = useState<string | null>(null);
    const [supplier, setSupplier] = useState<string | null>(null);

    // Step 2 — promotion type + type-specific options
    const [typeId, setTypeId] = useState<PromotionTypeId | null>(null);
    const [multiplier, setMultiplier] = useState<Multiplier | null>(null);
    const [products, setProducts] = useState("");
    const [eventName, setEventName] = useState("");
    const [questionTopics, setQuestionTopics] = useState("");

    // Step 3 — details
    const [promoName, setPromoName] = useState("");
    const [promoDescription, setPromoDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [supplierApproved, setSupplierApproved] = useState(false);
    const [supplierContact, setSupplierContact] = useState("");

    // Requests table + submit confirmation
    const [requests, setRequests] = useState<RequestRow[]>(initialRequests);
    const [statusFilter, setStatusFilter] = useState("all");
    const [successOpen, setSuccessOpen] = useState(false);

    const selectedType = promotionTypes.find((t) => t.id === typeId) ?? null;
    const memberLabel = members.find((m) => m.id === member)?.label;
    const supplierLabel = suppliers.find((s) => s.id === supplier)?.label;

    const minStart = earliestStartISO();
    const startTooSoon = startDate !== "" && startDate < minStart;
    const endBeforeStart = endDate !== "" && startDate !== "" && endDate < startDate;

    // Step completion drives the progressive reveal
    const step1Complete = member !== null && supplier !== null;
    const step2Complete =
        step1Complete &&
        selectedType !== null &&
        (!selectedType.needsMultiplier || multiplier !== null) &&
        (!selectedType.needsProducts || products.trim() !== "") &&
        (!selectedType.needsEventName || eventName.trim() !== "");
    const step3Complete = step2Complete && promoName.trim() !== "" && startDate !== "" && endDate !== "" && !startTooSoon && !endBeforeStart;

    const stepState = (complete: boolean, unlocked: boolean): StepState => (complete ? "complete" : unlocked ? "active" : "locked");

    const filteredRequests = useMemo(
        () => requests.filter((row) => statusFilter === "all" || row.status === statusFilter),
        [requests, statusFilter],
    );

    const selectType = (id: PromotionTypeId) => {
        setTypeId(id);
        // Type-specific options don't carry over between types
        setMultiplier(null);
        setProducts("");
        setEventName("");
        setQuestionTopics("");
    };

    const resetForm = () => {
        setMember(null);
        setSupplier(null);
        setTypeId(null);
        setMultiplier(null);
        setProducts("");
        setEventName("");
        setQuestionTopics("");
        setPromoName("");
        setPromoDescription("");
        setStartDate("");
        setEndDate("");
        setSupplierApproved(false);
        setSupplierContact("");
    };

    const handleSubmit = () => {
        if (!step3Complete || !selectedType || !supplierLabel) return;

        const newRow: RequestRow = {
            id: String(Date.now()),
            promotion: promoName.trim(),
            supplier: supplierLabel,
            type: multiplier ? `${selectedType.label} · ${multiplier}` : selectedType.label,
            dates: `${formatISODate(startDate)} - ${formatISODate(endDate)}`,
            status: "pending",
            submitted: new Date().toLocaleDateString("en-US"),
            reviewed: "—",
        };

        setRequests((prev) => [newRow, ...prev]);
        resetForm();
        setSuccessOpen(true);
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
            {/* Header */}
            <div>
                <h1 className="text-display-xs font-semibold text-primary">Promotions</h1>
                <p className="mt-1 text-sm text-tertiary">Request supplier-funded promotions and track the status of your requests.</p>
            </div>

            {/* Request form */}
            <div className="rounded-xl border border-secondary bg-primary p-5 lg:p-6">
                <div className="mb-5">
                    <h2 className="text-md font-semibold text-primary">Request a Supplier Promotion</h2>
                    <p className="mt-0.5 text-sm text-tertiary">Complete the steps below. Each step unlocks as you finish the one before it.</p>
                </div>

                {/* How it works banner */}
                <div className="mb-6 flex gap-3 rounded-lg bg-secondary p-4">
                    <InfoCircle className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                    <p className="text-sm text-tertiary">
                        <span className="font-semibold text-secondary">Plan ahead:</span>{" "}
                        Submit requests at least <span className="font-medium text-secondary">{MIN_LEAD_DAYS} days before</span> the promotion start date.
                    </p>
                </div>

                <div className="flex flex-col">
                    {/* Step 1 — Member & supplier */}
                    <StepSection
                        step={1}
                        title="Who is this promotion for?"
                        description="Choose your member organization and the supplier funding the promotion."
                        state={stepState(step1Complete, true)}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Select
                                label="Member"
                                placeholder="Select member..."
                                items={members}
                                selectedKey={member}
                                onSelectionChange={(key) => setMember(key ? String(key) : null)}
                                isRequired
                                size="md"
                            >
                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                            </Select>
                            <Select.ComboBox
                                label="Supplier"
                                placeholder="Search suppliers..."
                                items={suppliers}
                                selectedKey={supplier}
                                onSelectionChange={(key) => setSupplier(key ? String(key) : null)}
                                isRequired
                                size="md"
                            >
                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                            </Select.ComboBox>
                        </div>
                    </StepSection>

                    {/* Step 2 — Promotion type */}
                    <StepSection
                        step={2}
                        title="Choose a promotion type"
                        description="Each type works differently. Some require an extra selection once chosen."
                        state={stepState(step2Complete, step1Complete)}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Promotion type">
                                {promotionTypes.map((type) => {
                                    const isSelected = typeId === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            role="radio"
                                            aria-checked={isSelected}
                                            onClick={() => selectType(type.id)}
                                            className={cx(
                                                "flex flex-col gap-2.5 rounded-lg border p-4 text-left transition duration-100 ease-linear focus:outline-2 focus:outline-offset-2 focus:outline-brand",
                                                isSelected ? "border-brand ring-1 ring-brand" : "border-secondary hover:border-primary",
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <FeaturedIcon icon={type.icon} size="sm" color={isSelected ? "brand" : "gray"} theme={isSelected ? "light" : "modern"} />
                                                <div
                                                    className={cx(
                                                        "flex size-4 items-center justify-center rounded-full transition duration-100 ease-linear",
                                                        isSelected ? "bg-brand-solid" : "ring-1 ring-primary ring-inset",
                                                    )}
                                                >
                                                    {isSelected && <Check className="size-3 text-fg-white" aria-hidden="true" />}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-primary">{type.label}</p>
                                                <p className="mt-0.5 text-sm text-tertiary">{type.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Type-specific options */}
                            {selectedType && (selectedType.needsMultiplier || selectedType.needsProducts || selectedType.needsEventName || selectedType.id === "question-week") && (
                                <div className="flex flex-col gap-4 rounded-lg bg-secondary p-4">
                                    {selectedType.needsMultiplier && (
                                        <div>
                                            <p className="mb-1.5 text-sm font-medium text-secondary">
                                                Points multiplier <span className="text-brand-tertiary">*</span>
                                            </p>
                                            <ButtonGroup
                                                size="md"
                                                selectedKeys={multiplier ? [multiplier] : []}
                                                onSelectionChange={(keys) => {
                                                    const key = [...keys][0];
                                                    if (key) setMultiplier(key as Multiplier);
                                                }}
                                            >
                                                {multiplierOptions.map((option) => (
                                                    <ButtonGroupItem key={option} id={option}>
                                                        {option} points
                                                    </ButtonGroupItem>
                                                ))}
                                            </ButtonGroup>
                                        </div>
                                    )}
                                    {selectedType.needsProducts && (
                                        <TextArea
                                            label="Qualifying products"
                                            placeholder="List the products, SKUs, or categories included in this promotion..."
                                            rows={3}
                                            value={products}
                                            onChange={setProducts}
                                            isRequired
                                            size="sm"
                                        />
                                    )}
                                    {selectedType.needsEventName && (
                                        <Input
                                            label="Event name"
                                            placeholder="e.g. AD Live - Fall 2026"
                                            value={eventName}
                                            onChange={setEventName}
                                            isRequired
                                            size="md"
                                        />
                                    )}
                                    {selectedType.id === "question-week" && (
                                        <TextArea
                                            label="Question ideas or topics (optional)"
                                            placeholder="Suggest questions or topics. Leave blank and our team will draft them with the supplier."
                                            rows={3}
                                            value={questionTopics}
                                            onChange={setQuestionTopics}
                                            size="sm"
                                        />
                                    )}
                                </div>
                            )}
                            {selectedType && isGrowthType(selectedType.id) && (
                                <div className="flex gap-3 rounded-lg bg-secondary p-4">
                                    <InfoCircle className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                                    <p className="text-sm text-tertiary">
                                        Growth promotion goals are set individually. After you submit this request, our team will follow up with a goal
                                        model for approval.
                                    </p>
                                </div>
                            )}
                        </div>
                    </StepSection>

                    {/* Step 3 — Details */}
                    <StepSection
                        step={3}
                        title="Promotion details"
                        description="Name the promotion, describe it for participants, and set the dates."
                        state={stepState(step3Complete, step2Complete)}
                    >
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Promotion name"
                                placeholder="e.g. Milwaukee Heavy Duty Days"
                                value={promoName}
                                onChange={setPromoName}
                                isRequired
                                size="md"
                            />
                            <TextArea
                                label="Promotion description"
                                placeholder="Describe the promotion as participants should see it..."
                                rows={4}
                                value={promoDescription}
                                onChange={setPromoDescription}
                                size="sm"
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                    label="Start date"
                                    type="date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    isRequired
                                    isInvalid={startTooSoon}
                                    hint={
                                        startTooSoon
                                            ? `Start date must be at least ${MIN_LEAD_DAYS} days from today.`
                                            : `Earliest available start date is ${formatISODate(minStart)}.`
                                    }
                                    size="md"
                                />
                                <Input
                                    label="End date"
                                    type="date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    isRequired
                                    isInvalid={endBeforeStart}
                                    hint={endBeforeStart ? "End date must be on or after the start date." : undefined}
                                    size="md"
                                />
                            </div>
                            <div className="flex flex-col gap-4 rounded-lg bg-secondary p-4">
                                <Checkbox
                                    label="The supplier has already approved this promotion"
                                    hint="Check this if you've confirmed the promotion with your supplier contact."
                                    isSelected={supplierApproved}
                                    onChange={setSupplierApproved}
                                />
                                <TextArea
                                    label="Supplier contact (optional)"
                                    placeholder="Your contact at the supplier (name, email, phone)"
                                    rows={2}
                                    value={supplierContact}
                                    onChange={setSupplierContact}
                                    size="sm"
                                />
                            </div>
                        </div>
                    </StepSection>

                    {/* Step 4 — Review & submit */}
                    <StepSection
                        step={4}
                        title="Review & submit"
                        description="Everything look right? You can edit any step above before submitting."
                        state={stepState(false, step3Complete)}
                        isLast
                    >
                        <div className="flex flex-col gap-4">
                            <dl className="divide-y divide-border-secondary rounded-lg border border-secondary px-4 py-1">
                                <ReviewRow label="Member" value={memberLabel} />
                                <ReviewRow label="Supplier" value={supplierLabel} />
                                <ReviewRow
                                    label="Promotion type"
                                    value={
                                        <span className="flex flex-wrap items-center gap-2">
                                            {selectedType?.label}
                                            {multiplier && (
                                                <Badge type="pill-color" size="sm" color="brand">
                                                    {multiplier} points
                                                </Badge>
                                            )}
                                        </span>
                                    }
                                />
                                {selectedType?.needsProducts && <ReviewRow label="Qualifying products" value={products} />}
                                {selectedType?.needsEventName && <ReviewRow label="Event" value={eventName} />}
                                {selectedType?.id === "question-week" && questionTopics.trim() !== "" && (
                                    <ReviewRow label="Question ideas" value={questionTopics} />
                                )}
                                <ReviewRow label="Promotion name" value={promoName} />
                                {promoDescription.trim() !== "" && <ReviewRow label="Description" value={promoDescription} />}
                                <ReviewRow
                                    label="Dates"
                                    value={startDate && endDate ? `${formatISODate(startDate)} - ${formatISODate(endDate)}` : undefined}
                                />
                                <ReviewRow label="Supplier approved" value={supplierApproved ? "Yes" : "Not yet"} />
                                {supplierContact.trim() !== "" && <ReviewRow label="Supplier contact" value={supplierContact} />}
                            </dl>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-tertiary">Requests are typically reviewed within 2 business days.</p>
                                <Button size="md" color="primary" iconLeading={Send01} onClick={handleSubmit}>
                                    Submit Request
                                </Button>
                            </div>
                        </div>
                    </StepSection>
                </div>
            </div>

            {/* Requests table */}
            <TableCard.Root>
                <TableCard.Header
                    title="My Promotion Requests"
                    description="Track the status of every promotion request you've submitted."
                    badge={
                        <Badge type="pill-color" size="sm" color="gray">
                            {filteredRequests.length} requests
                        </Badge>
                    }
                    contentTrailing={
                        <Select
                            aria-label="Filter by status"
                            items={statusFilterItems}
                            selectedKey={statusFilter}
                            onSelectionChange={(key) => key && setStatusFilter(String(key))}
                            size="sm"
                        >
                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>
                    }
                />
                <Table size="md">
                    <Table.Header>
                        <Table.Head id="promotion" isRowHeader>Promotion</Table.Head>
                        <Table.Head id="supplier">Supplier</Table.Head>
                        <Table.Head id="type">Type</Table.Head>
                        <Table.Head id="dates">Dates</Table.Head>
                        <Table.Head id="status">Status</Table.Head>
                        <Table.Head id="submitted">Submitted</Table.Head>
                        <Table.Head id="reviewed">Reviewed</Table.Head>
                    </Table.Header>
                    <Table.Body items={filteredRequests}>
                        {(row) => (
                            <Table.Row key={row.id} id={row.id}>
                                <Table.Cell>
                                    <span className="text-sm font-medium text-primary">{row.promotion}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">{row.supplier}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">{row.type}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">{row.dates}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <StatusBadge status={row.status} />
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">{row.submitted}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">{row.reviewed}</span>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </TableCard.Root>

            {/* Submission confirmation */}
            <ModalOverlay isOpen={successOpen} onOpenChange={setSuccessOpen}>
                <Modal className="max-w-md">
                    <Dialog className="w-full">
                        <div className="w-full rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                            <FeaturedIcon icon={CheckCircle} color="success" theme="light" size="lg" />
                            <h2 className="mt-4 text-md font-semibold text-primary">Request submitted</h2>
                            <p className="mt-1 text-sm text-tertiary">
                                Your promotion request was sent to our team for review. You'll hear back within 2 business days, and you can track its
                                status in My Promotion Requests below.
                            </p>
                            <div className="mt-6 flex justify-end">
                                <Button color="secondary" size="md" onClick={() => setSuccessOpen(false)}>
                                    Done
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </div>
    );
};

import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
    Activity,
    Building07,
    Calendar,
    ChevronRight,
    CoinsStacked01,
    Edit05,
    Eye,
    Globe01,
    Key01,
    Lightbulb02,
    Lock01,
    LockUnlocked01,
    Mail01,
    Phone01,
    Shield01,
    Stars02,
    Translate01,
    TrendDown01,
    TrendUp01,
    Truck01,
    User01,
    UserCheck01,
    UserX01,
    Users01,
    Wallet02,
} from "@untitledui/icons";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import {
    buildFallbackDetails,
    initialParticipants,
    participantDetails,
    programItems,
    roleItems,
    type OrderItem,
    type Participant,
    type ParticipantDetails,
    type Role,
} from "@/pages/participants-data";

// ─── Helpers ─────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: "active" | "inactive" }) => (
    <Badge type="pill-color" size="sm" color={status === "active" ? "success" : "gray"}>
        {status === "active" ? "Active" : "Inactive"}
    </Badge>
);

const LockBadge = ({ isLocked }: { isLocked: boolean }) =>
    isLocked ? (
        <Badge type="pill-color" size="sm" color="warning">
            Locked
        </Badge>
    ) : null;

const RoleBadge = ({ role }: { role: Role }) => (
    <Badge type="pill-color" size="sm" color={role === "admin" ? "purple" : "blue"}>
        {role === "admin" ? "Admin" : "Participant"}
    </Badge>
);

// ─── Detail row ──────────────────────────────────────────────

const DetailRow = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.FC<{ className?: string }>;
    label: string;
    value: React.ReactNode;
}) => (
    <div className="flex items-start gap-3 py-3">
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg-quaternary" />
        <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-tertiary">{label}</p>
            <p className="text-sm font-medium text-primary">{value}</p>
        </div>
    </div>
);

// ─── Inline metric (used in the Points Issuance table header) ─

const InlineMetric = ({
    label,
    value,
    icon: Icon,
    accent = "text-fg-quaternary",
}: {
    label: string;
    value: number;
    icon: React.FC<{ className?: string }>;
    accent?: string;
}) => (
    <div className="flex items-center gap-2">
        <Icon aria-hidden="true" className={`size-4 ${accent}`} />
        <div className="flex flex-col leading-tight">
            <span className="text-xs text-tertiary">{label}</span>
            <span className="text-sm font-semibold text-primary">
                {value.toLocaleString()} <span className="text-xs font-normal text-tertiary">pts</span>
            </span>
        </div>
    </div>
);

// ─── AI insight summary ──────────────────────────────────────

const buildInsights = (
    participant: Participant,
    details: ParticipantDetails,
): { title: string; body: string; icon: React.FC<{ className?: string }>; tone: "success" | "brand" | "warning" }[] => {
    const insights: { title: string; body: string; icon: React.FC<{ className?: string }>; tone: "success" | "brand" | "warning" }[] = [];

    // Quick-spend pattern
    if (details.lifetimePointsSpent / Math.max(details.lifetimePointsIssued, 1) > 0.55 && details.orders.length > 0) {
        insights.push({
            title: "Redeems soon after earning",
            body: `Spends ~${Math.round(
                (details.lifetimePointsSpent / Math.max(details.lifetimePointsIssued, 1)) * 100,
            )}% of points within weeks of issuance — likely motivated by short-term rewards.`,
            icon: TrendDown01,
            tone: "warning",
        });
    } else if (details.lifetimePointsIssued > 0 && details.lifetimePointsSpent === 0) {
        insights.push({
            title: "Accumulating, not redeeming",
            body: "Has not spent any earned points yet. Consider a nudge toward popular catalog items to drive engagement.",
            icon: Wallet02,
            tone: "warning",
        });
    } else {
        insights.push({
            title: "Balanced redemption cadence",
            body: "Earns and spends at a healthy pace — a steady, predictable participant.",
            icon: Wallet02,
            tone: "success",
        });
    }

    // Category preference
    const itemNames = details.orders.flatMap((o) => o.items.map((i) => i.name.toLowerCase()));
    const homeHits = itemNames.filter((n) =>
        /tumbler|backpack|notebook|pen|home|kitchen|mug/.test(n),
    ).length;
    const techHits = itemNames.filter((n) =>
        /headphone|speaker|watch|tablet|stylus|charger|phone/.test(n),
    ).length;
    if (techHits > homeHits && techHits > 0) {
        insights.push({
            title: "Prefers Tech & Electronics",
            body: `Most redemptions land in the Tech category (${techHits} of ${itemNames.length} items). Surface new electronics first.`,
            icon: Stars02,
            tone: "brand",
        });
    } else if (homeHits > 0) {
        insights.push({
            title: "Prefers Home & Lifestyle",
            body: `Redeems for Home category items most often (${homeHits} of ${itemNames.length} items).`,
            icon: Stars02,
            tone: "brand",
        });
    }

    // Engagement / login proxy
    const issuanceCount = details.issuance.length;
    if (participant.status === "inactive") {
        insights.push({
            title: "Low engagement",
            body: "Account is currently inactive. No recent platform activity detected.",
            icon: Activity,
            tone: "warning",
        });
    } else if (issuanceCount >= 4) {
        insights.push({
            title: "Above-average engagement",
            body: `${issuanceCount} issuance events on record — logs in and earns more often than the program average.`,
            icon: Activity,
            tone: "success",
        });
    } else if (issuanceCount >= 2) {
        insights.push({
            title: "Steady engagement",
            body: `${issuanceCount} issuance events — engagement is on par with the program median.`,
            icon: Activity,
            tone: "success",
        });
    } else {
        insights.push({
            title: "Onboarding phase",
            body: "Only the welcome issuance recorded so far. A check-in or first-action nudge could lift engagement.",
            icon: Lightbulb02,
            tone: "brand",
        });
    }

    // Recency
    if (details.orders.length > 0) {
        insights.push({
            title: "Recent activity",
            body: `Last order placed on ${details.orders[0].date} for ${details.orders[0].pointsTotal.toLocaleString()} pts.`,
            icon: TrendUp01,
            tone: "brand",
        });
    }

    return insights.slice(0, 4);
};

const toneStyles: Record<"success" | "brand" | "warning", { bg: string; fg: string }> = {
    success: { bg: "bg-success-secondary", fg: "text-fg-success-primary" },
    brand: { bg: "bg-brand-secondary", fg: "text-fg-brand-primary" },
    warning: { bg: "bg-warning-secondary", fg: "text-fg-warning-primary" },
};

const AiSummaryCard = ({
    participant,
    details,
}: {
    participant: Participant;
    details: ParticipantDetails;
}) => {
    const insights = buildInsights(participant, details);
    return (
        <div className="flex h-full flex-col rounded-xl border border-secondary bg-primary p-5">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-brand-secondary">
                        <Stars02 aria-hidden="true" className="size-4 text-fg-brand-primary" />
                    </span>
                    <div>
                        <h2 className="text-md font-semibold text-primary">AI Summary</h2>
                        <p className="text-xs text-tertiary">Patterns spotted across this participant's activity.</p>
                    </div>
                </div>
                <Badge type="pill-color" size="sm" color="brand">
                    Beta
                </Badge>
            </div>

            <ul className="mt-4 flex flex-1 flex-col gap-3">
                {insights.map((insight) => {
                    const tone = toneStyles[insight.tone];
                    const Icon = insight.icon;
                    return (
                        <li key={insight.title} className="flex items-start gap-3">
                            <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${tone.bg}`}>
                                <Icon aria-hidden="true" className={`size-3.5 ${tone.fg}`} />
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-primary">{insight.title}</p>
                                <p className="text-sm text-tertiary">{insight.body}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

// ─── Order Details Modal ─────────────────────────────────────

const OrderDetailsModal = ({
    order,
    isOpen,
    onOpenChange,
}: {
    order: OrderItem | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) => {
    if (!order) return null;
    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal className="max-w-lg">
                <Dialog className="w-full">
                    <div className="w-full rounded-xl bg-primary shadow-xl ring-1 ring-secondary">
                        <div className="border-b border-secondary px-6 pt-6 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-brand-secondary">
                                    <Truck01 className="size-5 text-fg-brand-primary" />
                                </div>
                                <div>
                                    <h2 className="text-md font-semibold text-primary">Order {order.id}</h2>
                                    <p className="text-sm text-tertiary">Placed on {order.date}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 px-6 py-5">
                            <div>
                                <p className="text-xs font-medium text-tertiary uppercase tracking-wide">Items</p>
                                <ul className="mt-2 flex flex-col divide-y divide-secondary rounded-lg border border-secondary">
                                    {order.items.map((item) => (
                                        <li key={item.name} className="flex items-center justify-between px-3 py-2.5">
                                            <div>
                                                <p className="text-sm font-medium text-primary">{item.name}</p>
                                                <p className="text-xs text-tertiary">Qty {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium text-primary">
                                                {item.points.toLocaleString()} pts
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border border-secondary p-3">
                                    <p className="text-xs font-medium text-tertiary uppercase tracking-wide">
                                        Order total
                                    </p>
                                    <p className="mt-1 text-md font-semibold text-primary">
                                        {order.pointsTotal.toLocaleString()} pts
                                    </p>
                                </div>
                                <div className="rounded-lg border border-secondary p-3">
                                    <p className="text-xs font-medium text-tertiary uppercase tracking-wide">
                                        Item quantity
                                    </p>
                                    <p className="mt-1 text-md font-semibold text-primary">{order.itemQuantity}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-tertiary uppercase tracking-wide">
                                    Shipping address
                                </p>
                                <p className="mt-1 text-sm text-primary">{order.shippingAddress}</p>
                            </div>

                            {order.trackingNumber && (
                                <div>
                                    <p className="text-xs font-medium text-tertiary uppercase tracking-wide">
                                        Tracking number
                                    </p>
                                    <p className="mt-1 font-mono text-sm text-primary">{order.trackingNumber}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end border-t border-secondary px-6 py-4">
                            <Button color="secondary" size="md" onPress={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};

// ─── Inline edit form state ──────────────────────────────────

interface EditFormState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    loginId: string;
    role: Role;
    program: string;
    preferredLanguage: string;
    companyName: string;
    hireDate: string;
}

// ─── Confirmation Modal ──────────────────────────────────────

const ConfirmModal = ({
    isOpen,
    onOpenChange,
    title,
    message,
    confirmLabel,
    confirmColor = "primary",
    onConfirm,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor?: "primary" | "primary-destructive";
    onConfirm: () => void;
}) => (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal className="max-w-md">
            <Dialog className="w-full">
                <div className="w-full rounded-xl bg-primary shadow-xl ring-1 ring-secondary">
                    <div className="px-6 pt-6 pb-2">
                        <h2 className="text-md font-semibold text-primary">{title}</h2>
                        <p className="mt-1 text-sm text-tertiary">{message}</p>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4">
                        <Button color="secondary" size="md" onPress={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            color={confirmColor}
                            size="md"
                            onPress={() => {
                                onConfirm();
                                onOpenChange(false);
                            }}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </Modal>
    </ModalOverlay>
);

// ─── Page ────────────────────────────────────────────────────

export const ParticipantDetailsPage = () => {
    const { id = "" } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const baseParticipant = useMemo<Participant | undefined>(
        () => initialParticipants.find((p) => p.id === id),
        [id],
    );

    const [participant, setParticipant] = useState<Participant | undefined>(baseParticipant);
    const [details, setDetails] = useState<ParticipantDetails | undefined>(() => {
        if (!baseParticipant) return undefined;
        return participantDetails[baseParticipant.id] ?? buildFallbackDetails(baseParticipant);
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<EditFormState | null>(null);
    const [orderModal, setOrderModal] = useState<OrderItem | null>(null);
    const [confirm, setConfirm] = useState<
        | null
        | {
              kind: "lock" | "deactivate" | "reset" | "welcome";
          }
    >(null);

    // ── Not found
    if (!participant || !details) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <Users01 className="size-8 text-fg-quaternary" />
                <p className="text-md font-semibold text-primary">Participant not found</p>
                <p className="text-sm text-tertiary">The participant you are looking for does not exist.</p>
                <Button color="primary" size="md" onPress={() => navigate("/dashboard/participants")}>
                    Back to Participants
                </Button>
            </div>
        );
    }

    // ── Action handlers
    const toggleLock = () => setDetails((d) => (d ? { ...d, isLocked: !d.isLocked } : d));
    const toggleActive = () =>
        setParticipant((p) =>
            p ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p,
        );
    const resetPassword = () => {
        // Mock: would trigger a backend reset email
    };
    const sendWelcomeEmail = () => {
        // Mock: would trigger a backend welcome email
    };

    const startEditing = () => {
        setEditForm({
            firstName: details.firstName,
            lastName: details.lastName,
            email: participant.email,
            phone: details.phone,
            loginId: details.loginId,
            role: participant.role,
            program: participant.program,
            preferredLanguage: details.preferredLanguage,
            companyName: details.companyName,
            hireDate: details.hireDate,
        });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditForm(null);
    };

    const updateEditField = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) =>
        setEditForm((s) => (s ? { ...s, [key]: value } : s));

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm) return;
        const data = editForm;
        setParticipant((p) =>
            p
                ? {
                      ...p,
                      name: `${data.firstName} ${data.lastName}`.trim(),
                      email: data.email,
                      role: data.role,
                      program: data.program as Participant["program"],
                  }
                : p,
        );
        setDetails((d) =>
            d
                ? {
                      ...d,
                      firstName: data.firstName,
                      lastName: data.lastName,
                      phone: data.phone,
                      loginId: data.loginId,
                      preferredLanguage: data.preferredLanguage,
                      companyName: data.companyName,
                      hireDate: data.hireDate,
                  }
                : d,
        );
        setIsEditing(false);
        setEditForm(null);
    };

    const currentBalance = details.lifetimePointsIssued - details.lifetimePointsSpent;

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-1.5 text-sm">
                    <li>
                        <Link
                            to="/dashboard/participants"
                            className="flex items-center gap-1.5 text-tertiary transition duration-100 ease-linear hover:text-primary"
                        >
                            <Users01 aria-hidden="true" className="size-4" />
                            Participants
                        </Link>
                    </li>
                    <li aria-hidden="true">
                        <ChevronRight className="size-4 text-fg-quaternary" />
                    </li>
                    <li>
                        <span className="font-medium text-primary">{participant.name}</span>
                    </li>
                </ol>
            </nav>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-display-xs font-semibold text-primary">{participant.name}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <RoleBadge role={participant.role} />
                        <StatusBadge status={participant.status} />
                        <LockBadge isLocked={details.isLocked} />
                        <span className="text-sm text-tertiary">{participant.email}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Dropdown.Root>
                        <Button size="md" color="primary">
                            Account Actions
                        </Button>
                        <Dropdown.Popover>
                            <Dropdown.Menu
                                onAction={(key) => {
                                    if (key === "lock") setConfirm({ kind: "lock" });
                                    if (key === "deactivate") setConfirm({ kind: "deactivate" });
                                    if (key === "reset") setConfirm({ kind: "reset" });
                                    if (key === "welcome") setConfirm({ kind: "welcome" });
                                }}
                            >
                                <Dropdown.Section>
                                    <Dropdown.Item
                                        id="lock"
                                        label={details.isLocked ? "Unlock Account" : "Lock Account"}
                                        icon={details.isLocked ? LockUnlocked01 : Lock01}
                                    />
                                    <Dropdown.Item
                                        id="deactivate"
                                        label={participant.status === "active" ? "Deactivate Account" : "Activate Account"}
                                        icon={participant.status === "active" ? UserX01 : UserCheck01}
                                    />
                                </Dropdown.Section>
                                <Dropdown.Separator />
                                <Dropdown.Section>
                                    <Dropdown.Item id="reset" label="Reset Password" icon={Key01} />
                                    <Dropdown.Item id="welcome" label="Send Welcome Email" icon={Mail01} />
                                </Dropdown.Section>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown.Root>
                </div>
            </div>

            {/* Profile + Points Issuance summary */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile details */}
                <div className="rounded-xl border border-secondary bg-primary p-5 lg:col-span-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-md font-semibold text-primary">Profile Details</h2>
                        {!isEditing ? (
                            <Button
                                size="sm"
                                color="secondary"
                                iconLeading={Edit05}
                                onPress={startEditing}
                            >
                                Edit Details
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button size="sm" color="secondary" onPress={cancelEditing}>
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    color="primary"
                                    type="submit"
                                    form="profile-details-form"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className="mt-2 divide-y divide-secondary">
                            <DetailRow icon={Globe01} label="Program" value={participant.program} />
                            <DetailRow icon={User01} label="First Name" value={details.firstName} />
                            <DetailRow icon={User01} label="Last Name" value={details.lastName} />
                            <DetailRow icon={Mail01} label="Email" value={participant.email} />
                            <DetailRow icon={Phone01} label="Phone" value={details.phone} />
                            <DetailRow icon={Shield01} label="Login ID" value={details.loginId} />
                            <DetailRow icon={Translate01} label="Preferred Language" value={details.preferredLanguage} />
                            <DetailRow icon={Building07} label="Company Name" value={details.companyName} />
                            <DetailRow icon={Calendar} label="Hire / Anniversary Date" value={details.hireDate} />
                            <DetailRow icon={Calendar} label="Joined Platform" value={participant.joinedDate} />
                        </div>
                    ) : (
                        editForm && (
                            <form
                                id="profile-details-form"
                                onSubmit={handleSaveEdit}
                                className="mt-4 grid gap-4 sm:grid-cols-2"
                            >
                                <Select
                                    label="Program"
                                    items={programItems}
                                    selectedKey={editForm.program}
                                    onSelectionChange={(k) => updateEditField("program", String(k))}
                                    size="md"
                                    icon={Globe01}
                                >
                                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                </Select>
                                <Select
                                    label="Role"
                                    items={roleItems}
                                    selectedKey={editForm.role}
                                    onSelectionChange={(k) => updateEditField("role", k as Role)}
                                    size="md"
                                    icon={Shield01}
                                >
                                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                </Select>
                                <Input
                                    label="First Name"
                                    value={editForm.firstName}
                                    onChange={(v) => updateEditField("firstName", v)}
                                    isRequired
                                    size="md"
                                />
                                <Input
                                    label="Last Name"
                                    value={editForm.lastName}
                                    onChange={(v) => updateEditField("lastName", v)}
                                    isRequired
                                    size="md"
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    icon={Mail01}
                                    value={editForm.email}
                                    onChange={(v) => updateEditField("email", v)}
                                    isRequired
                                    size="md"
                                />
                                <Input
                                    label="Phone"
                                    icon={Phone01}
                                    value={editForm.phone}
                                    onChange={(v) => updateEditField("phone", v)}
                                    size="md"
                                />
                                <Input
                                    label="Login ID"
                                    icon={Shield01}
                                    value={editForm.loginId}
                                    onChange={(v) => updateEditField("loginId", v)}
                                    size="md"
                                />
                                <Input
                                    label="Preferred Language"
                                    icon={Translate01}
                                    value={editForm.preferredLanguage}
                                    onChange={(v) => updateEditField("preferredLanguage", v)}
                                    size="md"
                                />
                                <Input
                                    label="Company Name"
                                    icon={Building07}
                                    value={editForm.companyName}
                                    onChange={(v) => updateEditField("companyName", v)}
                                    size="md"
                                />
                                <Input
                                    label="Hire / Anniversary Date"
                                    icon={Calendar}
                                    value={editForm.hireDate}
                                    onChange={(v) => updateEditField("hireDate", v)}
                                    size="md"
                                />

                                <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
                                    <Button type="button" size="md" color="secondary" onPress={cancelEditing}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="md" color="primary" iconLeading={Edit05}>
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        )
                    )}
                </div>

                {/* AI Summary */}
                <AiSummaryCard participant={participant} details={details} />
            </div>

            {/* Orders */}
            <TableCard.Root>
                <TableCard.Header
                    title="Orders"
                    badge={
                        <Badge type="pill-color" size="sm" color="gray">
                            {details.orders.length}
                        </Badge>
                    }
                />
                <Table size="md">
                    <Table.Header>
                        <Table.Head id="orderId" isRowHeader>
                            Order ID
                        </Table.Head>
                        <Table.Head id="date">Date</Table.Head>
                        <Table.Head id="itemQty">Item Quantity</Table.Head>
                        <Table.Head id="total">Order Total (Points)</Table.Head>
                        <Table.Head id="actions" className="w-12">
                            <span className="sr-only">Actions</span>
                        </Table.Head>
                    </Table.Header>
                    <Table.Body
                        items={details.orders}
                        renderEmptyState={() => (
                            <div className="py-10 text-center">
                                <Truck01 className="mx-auto size-6 text-fg-quaternary" />
                                <p className="mt-2 text-sm font-medium text-primary">No orders yet</p>
                                <p className="mt-1 text-sm text-tertiary">
                                    This participant has not placed any orders.
                                </p>
                            </div>
                        )}
                    >
                        {(order) => (
                            <Table.Row key={order.id} id={order.id}>
                                <Table.Cell>
                                    <span className="font-mono text-sm font-medium text-primary">{order.id}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">{order.date}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-primary">{order.itemQuantity}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm font-medium text-primary">
                                        {order.pointsTotal.toLocaleString()} pts
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <Dropdown.Root>
                                        <Dropdown.DotsButton />
                                        <Dropdown.Popover>
                                            <Dropdown.Menu
                                                onAction={(key) => {
                                                    if (key === "view") setOrderModal(order);
                                                }}
                                            >
                                                <Dropdown.Section>
                                                    <Dropdown.Item id="view" label="View" icon={Eye} />
                                                </Dropdown.Section>
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown.Root>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </TableCard.Root>

            {/* Points Issuance */}
            <TableCard.Root>
                <TableCard.Header
                    title="Points Issuance"
                    description="History of points issued to this participant."
                    badge={
                        <Badge type="pill-color" size="sm" color="gray">
                            {details.issuance.length}
                        </Badge>
                    }
                    contentTrailing={
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                            <InlineMetric
                                label="Lifetime Issued"
                                value={details.lifetimePointsIssued}
                                icon={TrendUp01}
                                accent="text-fg-success-primary"
                            />
                            <InlineMetric
                                label="Lifetime Spent"
                                value={details.lifetimePointsSpent}
                                icon={TrendDown01}
                                accent="text-fg-error-primary"
                            />
                            <InlineMetric
                                label="Current Balance"
                                value={currentBalance}
                                icon={Wallet02}
                                accent="text-fg-brand-primary"
                            />
                        </div>
                    }
                />
                <Table size="md">
                    <Table.Header>
                        <Table.Head id="dateIssued" isRowHeader>
                            Date Issued
                        </Table.Head>
                        <Table.Head id="amount">Points Amount</Table.Head>
                        <Table.Head id="description">Description</Table.Head>
                    </Table.Header>
                    <Table.Body
                        items={details.issuance}
                        renderEmptyState={() => (
                            <div className="py-10 text-center">
                                <CoinsStacked01 className="mx-auto size-6 text-fg-quaternary" />
                                <p className="mt-2 text-sm font-medium text-primary">No issuance records</p>
                                <p className="mt-1 text-sm text-tertiary">
                                    This participant has not been issued any points.
                                </p>
                            </div>
                        )}
                    >
                        {(row) => (
                            <Table.Row key={row.id} id={row.id}>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">{row.dateIssued}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm font-medium text-primary">
                                        +{row.pointsAmount.toLocaleString()} pts
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-primary">{row.description}</span>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </TableCard.Root>

            {/* Modals */}
            <OrderDetailsModal
                order={orderModal}
                isOpen={orderModal !== null}
                onOpenChange={(open) => !open && setOrderModal(null)}
            />

            <ConfirmModal
                isOpen={confirm?.kind === "lock"}
                onOpenChange={(open) => !open && setConfirm(null)}
                title={details.isLocked ? "Unlock Account" : "Lock Account"}
                message={
                    details.isLocked
                        ? `Unlock ${participant.name}'s account? They will be able to sign in again.`
                        : `Lock ${participant.name}'s account? They will be unable to sign in until unlocked.`
                }
                confirmLabel={details.isLocked ? "Unlock" : "Lock"}
                confirmColor={details.isLocked ? "primary" : "primary-destructive"}
                onConfirm={toggleLock}
            />

            <ConfirmModal
                isOpen={confirm?.kind === "deactivate"}
                onOpenChange={(open) => !open && setConfirm(null)}
                title={participant.status === "active" ? "Deactivate Account" : "Activate Account"}
                message={
                    participant.status === "active"
                        ? `Deactivate ${participant.name}'s account? They will lose access to the platform.`
                        : `Activate ${participant.name}'s account? They will regain access to the platform.`
                }
                confirmLabel={participant.status === "active" ? "Deactivate" : "Activate"}
                confirmColor={participant.status === "active" ? "primary-destructive" : "primary"}
                onConfirm={toggleActive}
            />

            <ConfirmModal
                isOpen={confirm?.kind === "reset"}
                onOpenChange={(open) => !open && setConfirm(null)}
                title="Reset Password"
                message={`Send a password reset link to ${participant.email}?`}
                confirmLabel="Send Reset Link"
                onConfirm={resetPassword}
            />

            <ConfirmModal
                isOpen={confirm?.kind === "welcome"}
                onOpenChange={(open) => !open && setConfirm(null)}
                title="Send Welcome Email"
                message={`Send the welcome email to ${participant.email}?`}
                confirmLabel="Send Welcome Email"
                onConfirm={sendWelcomeEmail}
            />
        </div>
    );
};

import { useState } from "react";
import {
    ArrowDown,
    ArrowUp,
    Award01,
    CheckCircle,
    CoinsStacked01,
    CurrencyDollar,
    Send01,
    Users01,
} from "@untitledui/icons";
import { BulkUploadContent } from "@/components/application/bulk-upload";
import { Table, TableCard } from "@/components/application/table/table";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithIcon } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import type { SelectItemType } from "@/components/base/select/select";
import { Select } from "@/components/base/select/select";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { TextArea } from "@/components/base/textarea/textarea";
import { Toggle } from "@/components/base/toggle/toggle";

// ─── Mock data ───────────────────────────────────────────────

const participants: SelectItemType[] = [
    { id: "olivia", label: "Olivia Rhye", supportingText: "olivia@corerewards.com", avatarUrl: "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80" },
    { id: "phoenix", label: "Phoenix Baker", supportingText: "phoenix@corerewards.com", avatarUrl: "https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80" },
    { id: "lana", label: "Lana Steiner", supportingText: "lana@corerewards.com", avatarUrl: "https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80" },
    { id: "demi", label: "Demi Wilkinson", supportingText: "demi@corerewards.com", avatarUrl: "https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80" },
    { id: "candice", label: "Candice Wu", supportingText: "candice@corerewards.com", avatarUrl: "https://www.untitledui.com/images/avatars/candice-wu?fm=webp&q=80" },
    { id: "natali", label: "Natali Craig", supportingText: "natali@corerewards.com", avatarUrl: "https://www.untitledui.com/images/avatars/natali-craig?fm=webp&q=80" },
    { id: "drew", label: "Drew Cano", supportingText: "drew@corerewards.com", avatarUrl: "https://www.untitledui.com/images/avatars/drew-cano?fm=webp&q=80" },
];

const rewardTypes: SelectItemType[] = [
    { id: "points", label: "Points" },
    { id: "usd", label: "USD ($)" },
];

const additionalParameterItems: SelectItemType[] = [
    { id: "item-1", label: "Item 1" },
    { id: "item-2", label: "Item 2" },
    { id: "item-3", label: "Item 3" },
    { id: "item-4", label: "Item 4" },
    { id: "item-5", label: "Item 5" },
];

interface HistoryRow {
    id: string;
    recipient: { name: string; email: string; avatar: string };
    amount: string;
    type: "points" | "usd";
    message: string;
    date: string;
    status: "completed" | "pending" | "failed";
}

const historyData: HistoryRow[] = [
    {
        id: "1",
        recipient: { name: "Olivia Rhye", email: "olivia@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80" },
        amount: "500",
        type: "points",
        message: "Q1 performance bonus",
        date: "Apr 14, 2026",
        status: "completed",
    },
    {
        id: "2",
        recipient: { name: "Phoenix Baker", email: "phoenix@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80" },
        amount: "25.00",
        type: "usd",
        message: "Spot reward for client presentation",
        date: "Apr 13, 2026",
        status: "completed",
    },
    {
        id: "3",
        recipient: { name: "Lana Steiner", email: "lana@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80" },
        amount: "250",
        type: "points",
        message: "Sprint completion award",
        date: "Apr 12, 2026",
        status: "pending",
    },
    {
        id: "4",
        recipient: { name: "Demi Wilkinson", email: "demi@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80" },
        amount: "1,000",
        type: "points",
        message: "Annual recognition award",
        date: "Apr 11, 2026",
        status: "completed",
    },
    {
        id: "5",
        recipient: { name: "Candice Wu", email: "candice@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/candice-wu?fm=webp&q=80" },
        amount: "50.00",
        type: "usd",
        message: "Team lunch contribution",
        date: "Apr 10, 2026",
        status: "failed",
    },
];

// ─── Metrics ─────────────────────────────────────────────────

const MetricCard = ({
    label,
    value,
    change,
    changeDirection,
    icon: Icon,
}: {
    label: string;
    value: string;
    change: string;
    changeDirection: "up" | "down";
    icon: React.FC<{ className?: string }>;
}) => (
    <div className="rounded-xl border border-secondary bg-primary p-5">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-tertiary">{label}</p>
            <Icon className="size-5 text-fg-quaternary" />
        </div>
        <p className="mt-2 text-display-sm font-semibold text-primary">{value}</p>
        <div className="mt-2 flex items-center gap-1">
            <BadgeWithIcon
                type="pill-color"
                size="sm"
                color={changeDirection === "up" ? "success" : "error"}
                iconLeading={changeDirection === "up" ? ArrowUp : ArrowDown}
            >
                {change}
            </BadgeWithIcon>
            <span className="text-xs text-tertiary">vs last month</span>
        </div>
    </div>
);

// ─── Status badge helper ─────────────────────────────────────

const StatusBadge = ({ status }: { status: HistoryRow["status"] }) => {
    const config = {
        completed: { color: "success" as const, label: "Completed" },
        pending: { color: "warning" as const, label: "Pending" },
        failed: { color: "error" as const, label: "Failed" },
    }[status];

    return (
        <Badge type="pill-color" size="sm" color={config.color}>
            {config.label}
        </Badge>
    );
};

// ─── Page ────────────────────────────────────────────────────

export const IssuePointsPage = () => {
    const [rewardType, setRewardType] = useState<"points" | "usd">("points");

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
            {/* Header */}
            <div>
                <h1 className="text-display-xs font-semibold text-primary">Issue Points</h1>
                <p className="mt-1 text-sm text-tertiary">Reward participants with points or dollar amounts.</p>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard label="Total Points Issued" value="24,500" change="12.5%" changeDirection="up" icon={CoinsStacked01} />
                <MetricCard label="Active Participants" value="142" change="3.2%" changeDirection="up" icon={Users01} />
                <MetricCard label="Rewards This Month" value="$1,280" change="8.1%" changeDirection="down" icon={Award01} />
            </div>

            {/* Issue form + CSV upload */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Individual reward form */}
                <div className="rounded-xl border border-secondary bg-primary p-5">
                    <div className="mb-5 flex items-start justify-between">
                        <div>
                            <h2 className="text-md font-semibold text-primary">Issue Reward</h2>
                            <p className="mt-0.5 text-sm text-tertiary">Send points or dollars to a participant.</p>
                        </div>
                        <img src="/icon_issue-reward.png" alt="Issue reward" className="size-16 object-contain" />
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Participant selector */}
                        <Select.ComboBox
                            label="Participant"
                            placeholder="Search by name or email..."
                            items={participants}
                            isRequired
                            size="md"
                        >
                            {(item) => (
                                <Select.Item id={item.id} avatarUrl={item.avatarUrl} supportingText={item.supportingText}>
                                    {item.label}
                                </Select.Item>
                            )}
                        </Select.ComboBox>

                        {/* Amount + type row */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                                <Input
                                    label="Amount"
                                    placeholder={rewardType === "usd" ? "0.00" : "0"}
                                    type="number"
                                    icon={rewardType === "usd" ? CurrencyDollar : undefined}
                                    isRequired
                                    size="md"
                                />
                            </div>
                            <Select
                                label="Type"
                                items={rewardTypes}
                                selectedKey={rewardType}
                                onSelectionChange={(key) => setRewardType(key as "points" | "usd")}
                                size="md"
                            >
                                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                            </Select>
                        </div>

                        {/* Additional Parameter */}
                        <Select
                            label="Additional Parameter"
                            placeholder="Select an option..."
                            items={additionalParameterItems}
                            size="md"
                        >
                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>

                        {/* Message */}
                        <TextArea
                            label="Message"
                            placeholder="Add a note for the recipient..."
                            rows={3}
                            size="sm"
                        />

                        {/* Email notification toggle */}
                        <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                            <div>
                                <p className="text-sm font-medium text-secondary">Send email notification</p>
                                <p className="mt-0.5 text-sm text-tertiary">Notify the participant via email when the reward is issued.</p>
                            </div>
                            <Toggle size="sm" defaultSelected />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end pt-1">
                            <Button size="md" color="primary" iconLeading={Send01}>
                                Issue Reward
                            </Button>
                        </div>
                    </div>
                </div>

                {/* CSV upload — 1/4 width */}
                <div className="rounded-xl border border-secondary bg-secondary p-5">
                    <div className="mb-5 flex items-start justify-between">
                        <h2 className="text-md font-semibold text-primary">Bulk Issue Rewards</h2>
                        <img src="/icon_bulk-issue-reward.png" alt="Bulk issue rewards" className="size-16 object-contain" />
                    </div>

                    <BulkUploadContent
                        description="Upload a CSV to reward multiple participants at once."
                        processLabel="Process Upload"
                        templateHref="/dashboard/issue-points/template.csv"
                    />
                </div>
            </div>

            {/* Issuance history */}
            <TableCard.Root>
                <TableCard.Header
                    title="Issuance History"
                    description="Recent points and rewards issued to participants."
                    badge={<Badge type="pill-color" size="sm" color="gray">{historyData.length} records</Badge>}
                    contentTrailing={
                        <ButtonGroup size="sm" defaultSelectedKeys={["30"]}>
                            <ButtonGroupItem id="30">Last 30 days</ButtonGroupItem>
                            <ButtonGroupItem id="60">Last 60 days</ButtonGroupItem>
                        </ButtonGroup>
                    }
                />
                <Table size="md">
                    <Table.Header>
                        <Table.Head id="recipient" isRowHeader>Recipient</Table.Head>
                        <Table.Head id="amount">Amount</Table.Head>
                        <Table.Head id="message">Message</Table.Head>
                        <Table.Head id="date">Date</Table.Head>
                        <Table.Head id="status">Status</Table.Head>
                    </Table.Header>
                    <Table.Body items={historyData}>
                        {(row) => (
                            <Table.Row key={row.id} id={row.id}>
                                <Table.Cell>
                                    <div className="flex items-center gap-3">
                                        <Avatar size="sm" src={row.recipient.avatar} alt={row.recipient.name} />
                                        <div>
                                            <p className="text-sm font-medium text-primary">{row.recipient.name}</p>
                                            <p className="text-xs text-tertiary">{row.recipient.email}</p>
                                        </div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm font-medium text-primary">
                                        {row.type === "usd" ? `$${row.amount}` : `${row.amount} pts`}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">{row.message}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm text-tertiary">{row.date}</span>
                                </Table.Cell>
                                <Table.Cell>
                                    <StatusBadge status={row.status} />
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </TableCard.Root>
        </div>
    );
};

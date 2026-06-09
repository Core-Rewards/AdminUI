import { type Key, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
    AlertTriangle,
    Edit05,
    Eye,
    FilterLines,
    Mail01,
    Plus,
    SearchLg,
    Shield01,
    Trash02,
    Upload01,
    UserCircle,
    UserPlus01,
    Users01,
} from "@untitledui/icons";
import { BulkUploadContent } from "@/components/application/bulk-upload";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Table, TableCard } from "@/components/application/table/table";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import {
    filterProgramItems,
    filterRoleItems,
    initialParticipants,
    roleItems,
    type Participant,
    type Role,
    type Status,
} from "@/pages/participants-data";

// ─── Helpers ─────────────────────────────────────────────────

const RoleBadge = ({ role }: { role: Role }) => (
    <Badge type="pill-color" size="sm" color={role === "admin" ? "purple" : "blue"}>
        {role === "admin" ? "Admin" : "Participant"}
    </Badge>
);

const StatusBadge = ({ status }: { status: Status }) => (
    <Badge type="pill-color" size="sm" color={status === "active" ? "success" : "gray"}>
        {status === "active" ? "Active" : "Inactive"}
    </Badge>
);

// ─── Add / Edit Modal ────────────────────────────────────────

interface ParticipantFormData {
    name: string;
    email: string;
    role: Role;
}

const ParticipantModal = ({
    participant,
    isOpen,
    onOpenChange,
    onSave,
}: {
    participant?: Participant | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: ParticipantFormData) => void;
}) => {
    const isEditing = !!participant;
    const [name, setName] = useState(participant?.name ?? "");
    const [email, setEmail] = useState(participant?.email ?? "");
    const [role, setRole] = useState<Role>(participant?.role ?? "participant");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        onSave({ name: name.trim(), email: email.trim(), role });
        onOpenChange(false);
    };

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal className="max-w-lg">
                <Dialog className="w-full">
                    <div className="w-full rounded-xl bg-primary shadow-xl ring-1 ring-secondary">
                        {/* Header */}
                        <div className="border-b border-secondary px-6 pt-6 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-brand-secondary">
                                    {isEditing ? (
                                        <Edit05 className="size-5 text-fg-brand-primary" />
                                    ) : (
                                        <UserPlus01 className="size-5 text-fg-brand-primary" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-md font-semibold text-primary">
                                        {isEditing ? "Edit Participant" : "Add Participant"}
                                    </h2>
                                    <p className="text-sm text-tertiary">
                                        {isEditing
                                            ? "Update this participant's details and role."
                                            : "Add a new participant or admin to the platform."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-4 px-6 py-5">
                                <Input
                                    label="Full Name"
                                    placeholder="Enter full name"
                                    icon={UserCircle}
                                    value={name}
                                    onChange={setName}
                                    isRequired
                                    size="md"
                                />
                                <Input
                                    label="Email Address"
                                    placeholder="name@company.com"
                                    type="email"
                                    icon={Mail01}
                                    value={email}
                                    onChange={setEmail}
                                    isRequired
                                    size="md"
                                />
                                <Select
                                    label="Role"
                                    items={roleItems}
                                    selectedKey={role}
                                    onSelectionChange={(key) => setRole(key as Role)}
                                    size="md"
                                    icon={Shield01}
                                >
                                    {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                                </Select>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 border-t border-secondary px-6 py-4">
                                <Button type="button" color="secondary" size="md" onPress={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary" size="md" iconLeading={isEditing ? Edit05 : Plus}>
                                    {isEditing ? "Save Changes" : "Add Participant"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};

// ─── Row Actions ─────────────────────────────────────────────

const RowActions = ({
    participant,
    onView,
    onDelete,
}: {
    participant: Participant;
    onView: (p: Participant) => void;
    onDelete: (id: string) => void;
}) => (
    <Dropdown.Root>
        <Dropdown.DotsButton />
        <Dropdown.Popover>
            <Dropdown.Menu onAction={(key) => {
                if (key === "view") onView(participant);
                if (key === "delete") onDelete(participant.id);
            }}>
                <Dropdown.Section>
                    <Dropdown.Item id="view" label="View" icon={Eye} />
                </Dropdown.Section>
                <Dropdown.Separator />
                <Dropdown.Section>
                    <Dropdown.Item id="delete" label="Delete" icon={Trash02} className="text-error-primary" />
                </Dropdown.Section>
            </Dropdown.Menu>
        </Dropdown.Popover>
    </Dropdown.Root>
);

// ─── Page ────────────────────────────────────────────────────

export const ParticipantsPage = () => {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState(initialParticipants);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<Key>("all");
    const [programFilter, setProgramFilter] = useState<Key>("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

    const isProgramSelected = programFilter !== "all";

    const filteredParticipants = useMemo(() => {
        return participants.filter((p) => {
            const matchesSearch =
                !search ||
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.email.toLowerCase().includes(search.toLowerCase());
            const matchesRole = roleFilter === "all" || p.role === roleFilter;
            const matchesProgram = programFilter === "all" || p.program === programFilter;
            return matchesSearch && matchesRole && matchesProgram;
        });
    }, [participants, search, roleFilter, programFilter]);

    const counts = useMemo(
        () => ({
            total: participants.length,
            admins: participants.filter((p) => p.role === "admin").length,
            active: participants.filter((p) => p.status === "active").length,
        }),
        [participants],
    );

    const handleAdd = () => {
        setEditingParticipant(null);
        setModalOpen(true);
    };

    const handleView = (p: Participant) => {
        navigate(`/dashboard/participants/${p.id}`);
    };

    const handleDelete = (id: string) => {
        setParticipants((prev) => prev.filter((p) => p.id !== id));
    };

    const handleSave = (data: ParticipantFormData) => {
        if (editingParticipant) {
            setParticipants((prev) =>
                prev.map((p) =>
                    p.id === editingParticipant.id ? { ...p, ...data } : p,
                ),
            );
        } else {
            const newParticipant: Participant = {
                id: crypto.randomUUID(),
                name: data.name,
                email: data.email,
                avatar: "",
                role: data.role,
                status: "active",
                joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                pointsBalance: 0,
            };
            setParticipants((prev) => [newParticipant, ...prev]);
        }
        setEditingParticipant(null);
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
            {/* Header */}
            <div>
                <h1 className="text-display-xs font-semibold text-primary">Participants</h1>
                <p className="mt-1 text-sm text-tertiary">Manage platform participants and admins.</p>
            </div>

            {/* Program selector — required before adding participants */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-4">
                    <div className="w-full max-w-xs">
                        <Select
                            aria-label="Select program"
                            items={filterProgramItems}
                            selectedKey={programFilter}
                            onSelectionChange={setProgramFilter}
                            size="md"
                        >
                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>
                    </div>
                    {!isProgramSelected && (
                        <p className="ml-auto flex items-center gap-1.5 text-right text-sm text-tertiary">
                            <AlertTriangle aria-hidden="true" className="size-4 text-fg-warning-secondary" />
                            Select a program to add participants.
                        </p>
                    )}
                </div>
                {isProgramSelected && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button size="md" color="primary" iconLeading={UserPlus01} onPress={handleAdd}>
                            Add Participant
                        </Button>
                        <Button size="md" color="secondary" iconLeading={Upload01} onPress={() => setBulkModalOpen(true)}>
                            Bulk Add Participants
                        </Button>
                    </div>
                )}
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="Total Participants" value={counts.total} icon={Users01} />
                <MetricCard label="Admins" value={counts.admins} icon={Shield01} />
                <MetricCard label="Active" value={counts.active} icon={UserCircle} />
            </div>

            {/* Table */}
            <TableCard.Root>
                <TableCard.Header
                    title="All Participants"
                    badge={<Badge type="pill-color" size="sm" color="gray">{filteredParticipants.length}</Badge>}
                    contentTrailing={
                        <div className="flex items-center gap-3">
                            <Input
                                aria-label="Search participants"
                                placeholder="Search..."
                                icon={SearchLg}
                                size="sm"
                                value={search}
                                onChange={setSearch}
                            />
                            <Select
                                aria-label="Filter by role"
                                items={filterRoleItems}
                                selectedKey={roleFilter}
                                onSelectionChange={setRoleFilter}
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
                        <Table.Head id="name" isRowHeader>Name</Table.Head>
                        <Table.Head id="role">Role</Table.Head>
                        <Table.Head id="program">Program</Table.Head>
                        <Table.Head id="status">Status</Table.Head>
                        <Table.Head id="joined">Joined</Table.Head>
                        <Table.Head id="points">Points Balance</Table.Head>
                        <Table.Head id="actions" className="w-12"><span className="sr-only">Actions</span></Table.Head>
                    </Table.Header>
                    <Table.Body items={filteredParticipants} renderEmptyState={() => (
                        <div className="py-10 text-center">
                            <Users01 className="mx-auto size-6 text-fg-quaternary" />
                            <p className="mt-2 text-sm font-medium text-primary">No participants found</p>
                            <p className="mt-1 text-sm text-tertiary">Try adjusting your search or filter.</p>
                        </div>
                    )}>
                        {(row) => (
                            <Table.Row key={row.id} id={row.id}>
                                <Table.Cell>
                                    <div className="flex items-center gap-3">
                                        <Avatar size="sm" src={row.avatar || undefined} alt={row.name} initials={row.name.split(" ").map((n) => n[0]).join("")} />
                                        <div>
                                            <p className="text-sm font-medium text-primary">{row.name}</p>
                                            <p className="text-xs text-tertiary">{row.email}</p>
                                        </div>
                                    </div>
                                </Table.Cell>
                                <Table.Cell><RoleBadge role={row.role} /></Table.Cell>
                                <Table.Cell><span className="text-sm text-tertiary">{row.program}</span></Table.Cell>
                                <Table.Cell><StatusBadge status={row.status} /></Table.Cell>
                                <Table.Cell><span className="text-sm text-tertiary">{row.joinedDate}</span></Table.Cell>
                                <Table.Cell>
                                    <span className="text-sm font-medium text-primary">
                                        {row.pointsBalance.toLocaleString()} pts
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <RowActions participant={row} onView={handleView} onDelete={handleDelete} />
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </TableCard.Root>

            {/* Modal */}
            {/* Add / Edit modal */}
            {modalOpen && (
                <ParticipantModal
                    key={editingParticipant?.id ?? "new"}
                    participant={editingParticipant}
                    isOpen={modalOpen}
                    onOpenChange={setModalOpen}
                    onSave={handleSave}
                />
            )}

            {/* Bulk Add modal */}
            <ModalOverlay isOpen={bulkModalOpen} onOpenChange={setBulkModalOpen}>
                <Modal className="max-w-lg">
                    <Dialog className="w-full">
                        <div className="w-full rounded-xl bg-primary shadow-xl ring-1 ring-secondary">
                            <div className="border-b border-secondary px-6 pt-6 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-brand-secondary">
                                        <Upload01 className="size-5 text-fg-brand-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-md font-semibold text-primary">Bulk Add Participants</h2>
                                        <p className="text-sm text-tertiary">Upload a CSV to add multiple participants at once.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-5">
                                <BulkUploadContent
                                    description="Upload a CSV with columns for name and email. Choose the template that matches the role you're adding."
                                    processLabel="Add Participants"
                                    templateLinks={[
                                        { label: "Download Participant template", href: "/dashboard/participants/participant-template.csv" },
                                        { label: "Download Admin template", href: "/dashboard/participants/admin-template.csv" },
                                    ]}
                                />
                            </div>
                            <div className="flex justify-end border-t border-secondary px-6 py-4">
                                <Button color="secondary" size="md" onPress={() => setBulkModalOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </div>
    );
};

// ─── Metric card ─────────────────────────────────────────────

const MetricCard = ({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: React.FC<{ className?: string }>;
}) => (
    <div className="rounded-xl border border-secondary bg-primary p-5">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-tertiary">{label}</p>
            <Icon className="size-5 text-fg-quaternary" />
        </div>
        <p className="mt-2 text-display-sm font-semibold text-primary">{value}</p>
    </div>
);

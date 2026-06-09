// Shared mock data + types for the Participants list and the Participant Details page.

export type Role = "participant" | "admin";
export type Status = "active" | "inactive";
export type Program = "US" | "Australia" | "Canada" | "China" | "Japan" | "Mexico" | "UK";

export interface Participant {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: Role;
    status: Status;
    program: Program;
    joinedDate: string;
    pointsBalance: number;
}

export interface OrderItem {
    id: string;
    date: string;
    itemQuantity: number;
    pointsTotal: number;
    items: { name: string; quantity: number; points: number }[];
    shippingAddress: string;
    trackingNumber?: string;
}

export interface IssuanceEntry {
    id: string;
    dateIssued: string;
    pointsAmount: number;
    description: string;
}

export interface ParticipantDetails {
    firstName: string;
    lastName: string;
    phone: string;
    loginId: string;
    preferredLanguage: string;
    companyName: string;
    hireDate: string;
    isLocked: boolean;
    lifetimePointsIssued: number;
    lifetimePointsSpent: number;
    orders: OrderItem[];
    issuance: IssuanceEntry[];
}

export const initialParticipants: Participant[] = [
    { id: "1", name: "Olivia Rhye", email: "olivia@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80", role: "admin", status: "active", program: "US", joinedDate: "Jan 6, 2026", pointsBalance: 3200 },
    { id: "2", name: "Phoenix Baker", email: "phoenix@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/phoenix-baker?fm=webp&q=80", role: "participant", status: "active", program: "UK", joinedDate: "Feb 12, 2026", pointsBalance: 1450 },
    { id: "3", name: "Lana Steiner", email: "lana@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/lana-steiner?fm=webp&q=80", role: "participant", status: "active", program: "Canada", joinedDate: "Mar 1, 2026", pointsBalance: 820 },
    { id: "4", name: "Demi Wilkinson", email: "demi@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80", role: "admin", status: "active", program: "Australia", joinedDate: "Jan 15, 2026", pointsBalance: 5100 },
    { id: "5", name: "Candice Wu", email: "candice@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/candice-wu?fm=webp&q=80", role: "participant", status: "inactive", program: "China", joinedDate: "Feb 28, 2026", pointsBalance: 0 },
    { id: "6", name: "Natali Craig", email: "natali@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/natali-craig?fm=webp&q=80", role: "participant", status: "active", program: "Japan", joinedDate: "Mar 20, 2026", pointsBalance: 640 },
    { id: "7", name: "Drew Cano", email: "drew@corerewards.com", avatar: "https://www.untitledui.com/images/avatars/drew-cano?fm=webp&q=80", role: "participant", status: "active", program: "Mexico", joinedDate: "Apr 2, 2026", pointsBalance: 280 },
];

export const roleItems = [
    { id: "participant", label: "Participant" },
    { id: "admin", label: "Admin" },
];

export const filterRoleItems = [
    { id: "all", label: "All Roles" },
    ...roleItems,
];

export const programItems = [
    { id: "US", label: "US" },
    { id: "Australia", label: "Australia" },
    { id: "Canada", label: "Canada" },
    { id: "China", label: "China" },
    { id: "Japan", label: "Japan" },
    { id: "Mexico", label: "Mexico" },
    { id: "UK", label: "UK" },
];

export const filterProgramItems = [
    { id: "all", label: "All Programs" },
    ...programItems,
];

// Extended profile data, keyed by Participant.id.
export const participantDetails: Record<string, ParticipantDetails> = {
    "1": {
        firstName: "Olivia",
        lastName: "Rhye",
        phone: "+1 (415) 555-0142",
        loginId: "orhye",
        preferredLanguage: "English (US)",
        companyName: "Core Rewards, Inc.",
        hireDate: "Mar 14, 2021",
        isLocked: false,
        lifetimePointsIssued: 8400,
        lifetimePointsSpent: 5200,
        orders: [
            { id: "ORD-10241", date: "May 12, 2026", itemQuantity: 2, pointsTotal: 1800, items: [{ name: "Wireless Headphones", quantity: 1, points: 1500 }, { name: "Branded Tumbler", quantity: 1, points: 300 }], shippingAddress: "100 Market St, San Francisco, CA 94105", trackingNumber: "1Z999AA10123456784" },
            { id: "ORD-09870", date: "Mar 2, 2026", itemQuantity: 1, pointsTotal: 2500, items: [{ name: "Smart Watch", quantity: 1, points: 2500 }], shippingAddress: "100 Market St, San Francisco, CA 94105" },
            { id: "ORD-09451", date: "Jan 18, 2026", itemQuantity: 3, pointsTotal: 900, items: [{ name: "Notebook", quantity: 2, points: 400 }, { name: "Pen Set", quantity: 1, points: 500 }], shippingAddress: "100 Market St, San Francisco, CA 94105", trackingNumber: "1Z999AA10987654321" },
        ],
        issuance: [
            { id: "ISS-501", dateIssued: "May 1, 2026", pointsAmount: 1200, description: "Q2 performance bonus" },
            { id: "ISS-487", dateIssued: "Apr 14, 2026", pointsAmount: 500, description: "Peer recognition" },
            { id: "ISS-466", dateIssued: "Mar 12, 2026", pointsAmount: 1500, description: "Anniversary award - 5 years" },
            { id: "ISS-432", dateIssued: "Feb 5, 2026", pointsAmount: 2000, description: "Sales target achievement" },
            { id: "ISS-410", dateIssued: "Jan 6, 2026", pointsAmount: 3200, description: "Welcome bonus" },
        ],
    },
    "2": {
        firstName: "Phoenix",
        lastName: "Baker",
        phone: "+44 20 7946 0852",
        loginId: "pbaker",
        preferredLanguage: "English (UK)",
        companyName: "Core Rewards UK Ltd.",
        hireDate: "Aug 22, 2022",
        isLocked: false,
        lifetimePointsIssued: 3450,
        lifetimePointsSpent: 2000,
        orders: [
            { id: "ORD-10112", date: "Apr 19, 2026", itemQuantity: 1, pointsTotal: 2000, items: [{ name: "Bluetooth Speaker", quantity: 1, points: 2000 }], shippingAddress: "10 Downing St, London SW1A 2AA" },
        ],
        issuance: [
            { id: "ISS-498", dateIssued: "Apr 30, 2026", pointsAmount: 800, description: "Customer feedback award" },
            { id: "ISS-471", dateIssued: "Mar 15, 2026", pointsAmount: 1200, description: "Project completion" },
            { id: "ISS-445", dateIssued: "Feb 12, 2026", pointsAmount: 1450, description: "Welcome bonus" },
        ],
    },
    "3": {
        firstName: "Lana",
        lastName: "Steiner",
        phone: "+1 (604) 555-0118",
        loginId: "lsteiner",
        preferredLanguage: "English (CA)",
        companyName: "Core Rewards Canada",
        hireDate: "Nov 4, 2023",
        isLocked: false,
        lifetimePointsIssued: 1620,
        lifetimePointsSpent: 800,
        orders: [
            { id: "ORD-09921", date: "Mar 22, 2026", itemQuantity: 1, pointsTotal: 800, items: [{ name: "Travel Backpack", quantity: 1, points: 800 }], shippingAddress: "200 Burrard St, Vancouver, BC V6C 3L6" },
        ],
        issuance: [
            { id: "ISS-489", dateIssued: "Apr 5, 2026", pointsAmount: 800, description: "Peer recognition" },
            { id: "ISS-452", dateIssued: "Mar 1, 2026", pointsAmount: 820, description: "Welcome bonus" },
        ],
    },
    "4": {
        firstName: "Demi",
        lastName: "Wilkinson",
        phone: "+61 2 9374 4000",
        loginId: "dwilkinson",
        preferredLanguage: "English (AU)",
        companyName: "Core Rewards Australia",
        hireDate: "May 9, 2020",
        isLocked: false,
        lifetimePointsIssued: 9100,
        lifetimePointsSpent: 4000,
        orders: [
            { id: "ORD-10044", date: "Apr 2, 2026", itemQuantity: 2, pointsTotal: 4000, items: [{ name: "Tablet", quantity: 1, points: 3500 }, { name: "Stylus", quantity: 1, points: 500 }], shippingAddress: "1 Macquarie St, Sydney NSW 2000" },
        ],
        issuance: [
            { id: "ISS-493", dateIssued: "Apr 28, 2026", pointsAmount: 2500, description: "Leadership award" },
            { id: "ISS-461", dateIssued: "Feb 22, 2026", pointsAmount: 1500, description: "Q1 bonus" },
            { id: "ISS-422", dateIssued: "Jan 15, 2026", pointsAmount: 5100, description: "Welcome bonus" },
        ],
    },
    "5": {
        firstName: "Candice",
        lastName: "Wu",
        phone: "+86 21 5888 8888",
        loginId: "cwu",
        preferredLanguage: "Chinese (Simplified)",
        companyName: "Core Rewards China",
        hireDate: "Sep 1, 2024",
        isLocked: true,
        lifetimePointsIssued: 0,
        lifetimePointsSpent: 0,
        orders: [],
        issuance: [],
    },
    "6": {
        firstName: "Natali",
        lastName: "Craig",
        phone: "+81 3 3201 3331",
        loginId: "ncraig",
        preferredLanguage: "Japanese",
        companyName: "Core Rewards Japan",
        hireDate: "Mar 20, 2026",
        isLocked: false,
        lifetimePointsIssued: 640,
        lifetimePointsSpent: 0,
        orders: [],
        issuance: [
            { id: "ISS-475", dateIssued: "Mar 20, 2026", pointsAmount: 640, description: "Welcome bonus" },
        ],
    },
    "7": {
        firstName: "Drew",
        lastName: "Cano",
        phone: "+52 55 5128 5000",
        loginId: "dcano",
        preferredLanguage: "Spanish (Mexico)",
        companyName: "Core Rewards Mexico",
        hireDate: "Apr 2, 2026",
        isLocked: false,
        lifetimePointsIssued: 280,
        lifetimePointsSpent: 0,
        orders: [],
        issuance: [
            { id: "ISS-481", dateIssued: "Apr 2, 2026", pointsAmount: 280, description: "Welcome bonus" },
        ],
    },
};

export const buildFallbackDetails = (p: Participant): ParticipantDetails => {
    const [firstName = "", ...rest] = p.name.split(" ");
    const lastName = rest.join(" ");
    return {
        firstName,
        lastName,
        phone: "+1 (555) 000-0000",
        loginId: p.email.split("@")[0] ?? p.id,
        preferredLanguage: "English (US)",
        companyName: "Core Rewards",
        hireDate: p.joinedDate,
        isLocked: false,
        lifetimePointsIssued: p.pointsBalance,
        lifetimePointsSpent: 0,
        orders: [],
        issuance: [],
    };
};

import { createContext, useContext, useState, type ReactNode } from "react";

export type Role = "admin" | "member";
export type Frequency = "Weekly" | "Monthly" | "Custom";
export type MemberStatus = "paid" | "pending" | "overdue";

export interface Member {
  id: string;
  name: string;
  initials: string;
  status: MemberStatus;
  position: number;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  role: Role;
  amount: number;
  frequency: Frequency;
  maxMembers: number;
  rotation: "Random" | "Manual" | "Fixed Order";
  members: Member[];
  cycle: number;
  totalCycles: number;
  nextDue: string; // human string
  nextPayoutMember: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: "contribution" | "joined" | "payout" | "reminder" | "overdue" | "created";
  title: string;
  meta: string;
  time: string;
  circleId?: string;
}

export interface Payment {
  id: string;
  circleId: string;
  circleName: string;
  amount: number;
  due: string;
  status: "upcoming" | "paid" | "missed";
}

export interface User {
  name: string;
  phone: string;
  email: string;
  initials: string;
  virtualAccount: {
    number: string;
    bank: string;
    name: string;
  };
}

const initialUser: User = {
  name: "Funke Adeola",
  phone: "+234 803 555 0114",
  email: "funke@kolo.ng",
  initials: "FA",
  virtualAccount: {
    number: "8021340977",
    bank: "Nomba Virtual Account",
    name: "FUNKE ADEOLA / KOLO",
  },
};

const seedMembers = (n: number, paidCount: number): Member[] => {
  const names = [
    "Funke Adeola", "Tunde Bakare", "Chioma Okafor", "Kelechi Umeh",
    "Aisha Bello", "Segun Owolabi", "Ngozi Eze", "Yusuf Musa",
    "Zainab Kola", "Deji Ade", "Ifeanyi Obi", "Halima Bala",
  ];
  return Array.from({ length: n }, (_, i) => {
    const name = names[i % names.length];
    const parts = name.split(" ");
    return {
      id: `m${i}`,
      name,
      initials: (parts[0][0] + parts[1][0]).toUpperCase(),
      status: i < paidCount ? "paid" : i === paidCount ? "pending" : "pending",
      position: i + 1,
    };
  });
};

const initialCircles: Circle[] = [
  {
    id: "friends",
    name: "Friends Savings",
    description: "Monthly Ajo with the girls. Payout goes to one member every month.",
    role: "admin",
    amount: 10000,
    frequency: "Monthly",
    maxMembers: 10,
    rotation: "Fixed Order",
    members: seedMembers(10, 6),
    cycle: 4,
    totalCycles: 10,
    nextDue: "Tomorrow",
    nextPayoutMember: "Chioma Okafor",
    createdAt: "2 months ago",
  },
  {
    id: "office",
    name: "Office KOLO",
    description: "Weekly contribution with the team at work.",
    role: "member",
    amount: 5000,
    frequency: "Weekly",
    maxMembers: 10,
    rotation: "Random",
    members: seedMembers(10, 8),
    cycle: 7,
    totalCycles: 10,
    nextDue: "Friday",
    nextPayoutMember: "You",
    createdAt: "3 weeks ago",
  },
  {
    id: "family",
    name: "Family Circle",
    description: "Family savings towards year-end.",
    role: "member",
    amount: 20000,
    frequency: "Monthly",
    maxMembers: 6,
    rotation: "Manual",
    members: seedMembers(6, 3),
    cycle: 2,
    totalCycles: 6,
    nextDue: "In 5 days",
    nextPayoutMember: "Tunde Bakare",
    createdAt: "1 month ago",
  },
];

const initialActivity: ActivityItem[] = [
  { id: "a1", type: "contribution", title: "Your contribution was received", meta: "Friends Savings · ₦10,000", time: "2h ago", circleId: "friends" },
  { id: "a2", type: "joined", title: "Aisha Bello joined your circle", meta: "Office KOLO", time: "5h ago", circleId: "office" },
  { id: "a3", type: "payout", title: "Payout completed", meta: "Family Circle · ₦120,000 to Ngozi Eze", time: "Yesterday", circleId: "family" },
  { id: "a4", type: "reminder", title: "Reminder sent to 4 members", meta: "Friends Savings", time: "Yesterday", circleId: "friends" },
  { id: "a5", type: "overdue", title: "Kelechi Umeh is overdue", meta: "Friends Savings · ₦10,000", time: "2 days ago", circleId: "friends" },
  { id: "a6", type: "created", title: "You created Family Circle", meta: "Monthly · 6 members", time: "1 month ago", circleId: "family" },
];

const initialPayments: Payment[] = [
  { id: "p1", circleId: "friends", circleName: "Friends Savings", amount: 10000, due: "Tomorrow", status: "upcoming" },
  { id: "p2", circleId: "office", circleName: "Office KOLO", amount: 5000, due: "Friday", status: "upcoming" },
  { id: "p3", circleId: "family", circleName: "Family Circle", amount: 20000, due: "In 5 days", status: "upcoming" },
  { id: "p4", circleId: "friends", circleName: "Friends Savings", amount: 10000, due: "Last month", status: "paid" },
  { id: "p5", circleId: "office", circleName: "Office KOLO", amount: 5000, due: "Last week", status: "paid" },
  { id: "p6", circleId: "family", circleName: "Family Circle", amount: 20000, due: "3 weeks ago", status: "missed" },
];

interface AppState {
  user: User;
  circles: Circle[];
  activity: ActivityItem[];
  payments: Payment[];
  addCircle: (c: Omit<Circle, "id" | "members" | "cycle" | "nextDue" | "nextPayoutMember" | "createdAt">) => string;
  payContribution: (paymentId: string) => void;
}

const AppCtx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [circles, setCircles] = useState(initialCircles);
  const [activity, setActivity] = useState(initialActivity);
  const [payments, setPayments] = useState(initialPayments);

  const addCircle: AppState["addCircle"] = (c) => {
    const id = c.name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.random().toString(36).slice(2, 6);
    const newCircle: Circle = {
      ...c,
      id,
      members: [{ id: "m0", name: "Funke Adeola (You)", initials: "FA", status: "paid", position: 1 }],
      cycle: 1,
      nextDue: "In 7 days",
      nextPayoutMember: "You",
      createdAt: "Just now",
    };
    setCircles((prev) => [newCircle, ...prev]);
    setActivity((prev) => [
      { id: `a${Date.now()}`, type: "created", title: `You created ${c.name}`, meta: `${c.frequency} · ${c.maxMembers} members`, time: "Just now", circleId: id },
      ...prev,
    ]);
    return id;
  };

  const payContribution = (paymentId: string) => {
    setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, status: "paid" } : p)));
    const p = payments.find((x) => x.id === paymentId);
    if (p) {
      setActivity((prev) => [
        { id: `a${Date.now()}`, type: "contribution", title: "Your contribution was received", meta: `${p.circleName} · ₦${p.amount.toLocaleString()}`, time: "Just now", circleId: p.circleId },
        ...prev,
      ]);
    }
  };

  return (
    <AppCtx.Provider value={{ user: initialUser, circles, activity, payments, addCircle, payContribution }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

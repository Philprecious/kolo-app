import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
  nextDue: string;
  nextPayoutMember: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: "contribution" | "joined" | "payout" | "reminder" | "overdue" | "created" | "invitation";
  title: string;
  meta: string;
  time: string;
  circleId?: string;
  // invitation-only
  invite?: {
    groupName: string;
    from: string;
    inviteCode: string;
    status: "pending" | "accepted" | "declined";
  };
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
  name: "Philip Precious",
  phone: "+234 803 555 0114",
  email: "philip@kolo.ng",
  initials: "PP",
  virtualAccount: {
    number: "8021340977",
    bank: "Nomba Virtual Account",
    name: "PHILIP PRECIOUS / KOLO",
  },
};

const seedMembers = (n: number, paidCount: number): Member[] => {
  const names = [
    "Philip Precious", "Tunde Bakare", "Chioma Okafor", "Kelechi Umeh",
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
      status: i < paidCount ? "paid" : "pending",
      position: i + 1,
    } as Member;
  });
};

const initialCircles: Circle[] = [
  {
    id: "bodija-women",
    name: "Bodija Women Ajo",
    description: "Weekly market Ajo for the Bodija women's cooperative.",
    role: "admin",
    amount: 10000,
    frequency: "Weekly",
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
    id: "precious-member",
    name: "Precious Member Ajo",
    description: "Rotating target-savings circle amongst trusted members.",
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
];

const initialActivity: ActivityItem[] = [
  {
    id: "inv1",
    type: "invitation",
    title: "You have been invited to join Ibadan Traders Ajo",
    meta: "From Segun Owolabi · Weekly · ₦15,000",
    time: "10m ago",
    invite: { groupName: "Ibadan Traders Ajo", from: "Segun Owolabi", inviteCode: "IBTRA-2026", status: "pending" },
  },
  { id: "a1", type: "contribution", title: "Your contribution was received", meta: "Bodija Women Ajo · ₦10,000", time: "2h ago", circleId: "bodija-women" },
  { id: "a2", type: "joined", title: "Aisha Bello joined your circle", meta: "Precious Member Ajo", time: "5h ago", circleId: "precious-member" },
  { id: "a3", type: "payout", title: "Payout completed", meta: "Bodija Women Ajo · ₦100,000 to Ngozi Eze", time: "Yesterday", circleId: "bodija-women" },
  { id: "a5", type: "overdue", title: "Kelechi Umeh is overdue", meta: "Bodija Women Ajo · ₦10,000", time: "2 days ago", circleId: "bodija-women" },
];

const initialPayments: Payment[] = [
  { id: "p1", circleId: "bodija-women", circleName: "Bodija Women Ajo", amount: 10000, due: "Tomorrow", status: "upcoming" },
  { id: "p2", circleId: "precious-member", circleName: "Precious Member Ajo", amount: 5000, due: "Friday", status: "upcoming" },
  { id: "p4", circleId: "bodija-women", circleName: "Bodija Women Ajo", amount: 10000, due: "Last week", status: "paid" },
  { id: "p5", circleId: "precious-member", circleName: "Precious Member Ajo", amount: 5000, due: "Last week", status: "paid" },
];

interface AppState {
  user: User;
  circles: Circle[];
  activity: ActivityItem[];
  payments: Payment[];
  devMode: boolean;
  setDevMode: (v: boolean) => void;
  addCircle: (c: Omit<Circle, "id" | "members" | "cycle" | "nextDue" | "nextPayoutMember" | "createdAt">) => string;
  payContribution: (paymentId: string) => void;
  respondInvitation: (id: string, action: "accepted" | "declined") => void;
  resetOnboarding: () => void;
}

const AppCtx = createContext<AppState | null>(null);

const STORAGE_KEY = "kolo_state_v1";

type Persisted = { circles: Circle[]; activity: ActivityItem[]; payments: Payment[]; devMode: boolean };

function loadPersisted(): Partial<Persisted> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Persisted;
  } catch {
    return {};
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = typeof window !== "undefined" ? loadPersisted() : {};
  const [circles, setCircles] = useState<Circle[]>(persisted.circles ?? initialCircles);
  const [activity, setActivity] = useState<ActivityItem[]>(persisted.activity ?? initialActivity);
  const [payments, setPayments] = useState<Payment[]>(persisted.payments ?? initialPayments);
  const [devMode, setDevMode] = useState<boolean>(persisted.devMode ?? false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ circles, activity, payments, devMode } satisfies Persisted),
      );
    } catch { /* ignore */ }
  }, [circles, activity, payments, devMode]);

  const addCircle: AppState["addCircle"] = (c) => {
    const id = c.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    const newCircle: Circle = {
      ...c,
      id,
      members: [{ id: "m0", name: "Philip Precious (You)", initials: "PP", status: "paid", position: 1 }],
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

  const respondInvitation: AppState["respondInvitation"] = (id, action) => {
    setActivity((prev) =>
      prev.map((a) =>
        a.id === id && a.type === "invitation" && a.invite
          ? { ...a, invite: { ...a.invite, status: action }, time: "Just now" }
          : a,
      ),
    );
  };

  const resetOnboarding = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem("kolo_onboarded");
      window.localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  };

  return (
    <AppCtx.Provider
      value={{
        user: initialUser,
        circles,
        activity,
        payments,
        devMode,
        setDevMode,
        addCircle,
        payContribution,
        respondInvitation,
        resetOnboarding,
      }}
    >
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

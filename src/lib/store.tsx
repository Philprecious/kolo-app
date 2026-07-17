import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "member";
export type Frequency = "Weekly" | "Monthly" | "Custom";
export type MemberStatus = "paid" | "pending" | "overdue";

export interface Member {
  id: string;
  name: string;
  initials: string;
  status: MemberStatus;
  position: number;
  userId: string | null;
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
  type: "contribution" | "joined" | "payout" | "reminder" | "overdue" | "created" | "invitation" | "notified";
  title: string;
  meta: string;
  time: string;
  circleId?: string;
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

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  kind: string;
  circleId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  initials: string;
  onboarded: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifyReminders: boolean;
  hasPin: boolean;
  virtualAccount: { number: string; bank: string; name: string };
}

const guestUser: User = {
  id: "",
  name: "Guest",
  phone: "",
  email: "",
  initials: "GU",
  onboarded: false,
  notifyEmail: true,
  notifyPush: true,
  notifyReminders: true,
  hasPin: false,
  virtualAccount: { number: "", bank: "Nomba Virtual Account", name: "" },
};

interface AppState {
  loading: boolean;
  session: Session | null;
  supaUser: SupabaseUser | null;
  user: User;
  circles: Circle[];
  activity: ActivityItem[];
  payments: Payment[];
  notifications: NotificationItem[];
  unreadCount: number;
  devMode: boolean;
  setDevMode: (v: boolean) => void;
  addCircle: (c: Omit<Circle, "id" | "members" | "cycle" | "nextDue" | "nextPayoutMember" | "createdAt">) => Promise<string | null>;
  payContribution: (paymentId: string) => Promise<void>;
  respondInvitation: (id: string, action: "accepted" | "declined") => void;
  notifyUnpaid: (circleId: string) => Promise<number>;
  markAllNotificationsRead: () => Promise<void>;
  updateProfile: (patch: Partial<{ display_name: string; phone: string; notify_email: boolean; notify_push: boolean; notify_reminders: boolean; onboarded: boolean; pin_hash: string }>) => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const AppCtx = createContext<AppState | null>(null);

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "KO";
  const a = parts[0][0] ?? "K";
  const b = parts[1]?.[0] ?? parts[0][1] ?? "O";
  return (a + b).toUpperCase();
}

function relTime(iso: string) {
  const d = new Date(iso).getTime();
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)} days ago`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [supaUser, setSupaUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User>(guestUser);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [devMode, setDevMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try { return window.localStorage.getItem("kolo_dev_mode") === "1"; } catch { return false; }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try { window.localStorage.setItem("kolo_dev_mode", devMode ? "1" : "0"); } catch { /* ignore */ }
    }
  }, [devMode]);

  const fetchAll = useCallback(async (uid: string, sess: Session | null) => {
    // Profile
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    const email = sess?.user.email ?? "";
    if (prof) {
      setUser({
        id: uid,
        name: prof.display_name || email.split("@")[0] || "You",
        phone: prof.phone ?? "",
        email,
        initials: initials(prof.display_name || email),
        onboarded: prof.onboarded,
        notifyEmail: prof.notify_email,
        notifyPush: prof.notify_push,
        notifyReminders: prof.notify_reminders,
        hasPin: !!prof.pin_hash,
        virtualAccount: {
          number: prof.virtual_account_number,
          bank: "Nomba Virtual Account",
          name: prof.virtual_account_name,
        },
      });
    }

    // Circles + members
    const { data: circleRows } = await supabase.from("circles").select("*").order("created_at", { ascending: false });
    const circleIds = (circleRows ?? []).map((c) => c.id);
    const { data: memberRows } = circleIds.length
      ? await supabase.from("circle_members").select("*").in("circle_id", circleIds).order("position")
      : { data: [] as never[] };
    const { data: paymentRows } = circleIds.length
      ? await supabase.from("payments").select("*").in("circle_id", circleIds).order("created_at", { ascending: false })
      : { data: [] as never[] };

    const memsByCircle = new Map<string, Member[]>();
    for (const m of memberRows ?? []) {
      const arr = memsByCircle.get(m.circle_id) ?? [];
      arr.push({
        id: m.id, name: m.name, initials: m.initials, status: m.status as MemberStatus,
        position: m.position, userId: m.user_id,
      });
      memsByCircle.set(m.circle_id, arr);
    }

    const mappedCircles: Circle[] = (circleRows ?? []).map((c) => {
      const mems = memsByCircle.get(c.id) ?? [];
      const myRole = mems.find((m) => m.userId === uid)?.name ? mems.find((m) => m.userId === uid)! : null;
      const role: Role = mems.find((m) => m.userId === uid)?.userId === uid
        ? (memberRows!.find((mm) => mm.circle_id === c.id && mm.user_id === uid)?.role as Role) ?? "member"
        : "member";
      void myRole;
      return {
        id: c.id, name: c.name, description: c.description,
        role,
        amount: c.contribution_amount,
        frequency: c.frequency as Frequency,
        maxMembers: c.max_members,
        rotation: c.rotation as Circle["rotation"],
        members: mems,
        cycle: c.current_cycle,
        totalCycles: c.total_cycles,
        nextDue: c.next_due,
        nextPayoutMember: c.next_payout_member,
        createdAt: relTime(c.created_at),
      };
    });
    setCircles(mappedCircles);

    const circleNameById = new Map(mappedCircles.map((c) => [c.id, c.name]));
    setPayments((paymentRows ?? []).map((p) => ({
      id: p.id,
      circleId: p.circle_id,
      circleName: circleNameById.get(p.circle_id) ?? "Circle",
      amount: p.amount,
      due: p.due,
      status: p.status as Payment["status"],
    })));

    // Activity (limit 50)
    const { data: actRows } = await supabase
      .from("activity")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setActivity((actRows ?? []).map((a) => ({
      id: a.id,
      type: a.type as ActivityItem["type"],
      title: a.title,
      meta: a.meta,
      time: relTime(a.created_at),
      circleId: a.circle_id ?? undefined,
      invite: a.invite as ActivityItem["invite"],
    })));

    // Notifications
    const { data: notes } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications((notes ?? []).map((n) => ({
      id: n.id, title: n.title, body: n.body, kind: n.kind,
      circleId: n.circle_id, readAt: n.read_at, createdAt: n.created_at,
    })));
  }, []);

  const refresh = useCallback(async () => {
    if (supaUser) await fetchAll(supaUser.id, session);
  }, [fetchAll, supaUser, session]);

  // Auth bootstrap
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setSupaUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchAll(data.session.user.id, data.session).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setSupaUser(sess?.user ?? null);
      if (sess?.user) {
        setLoading(true);
        fetchAll(sess.user.id, sess).finally(() => setLoading(false));
      } else {
        setUser(guestUser);
        setCircles([]); setActivity([]); setPayments([]); setNotifications([]);
        setLoading(false);
      }
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [fetchAll]);

  const addCircle: AppState["addCircle"] = async (c) => {
    if (!supaUser) return null;
    const { data: inserted, error } = await supabase.from("circles").insert({
      name: c.name, description: c.description,
      contribution_amount: c.amount, frequency: c.frequency,
      max_members: c.maxMembers, rotation: c.rotation,
      total_cycles: c.totalCycles, current_cycle: 1,
      next_due: "In 7 days", next_payout_member: user.name,
      created_by: supaUser.id,
    }).select().single();
    if (error || !inserted) return null;

    await supabase.from("circle_members").insert({
      circle_id: inserted.id, user_id: supaUser.id,
      name: `${user.name} (You)`, initials: user.initials,
      position: 1, role: "admin", status: "paid",
    });
    await supabase.from("activity").insert({
      circle_id: inserted.id, user_id: supaUser.id,
      type: "created", title: `You created ${c.name}`,
      meta: `${c.frequency} · ${c.maxMembers} members`,
    });
    await refresh();
    return inserted.id;
  };

  const payContribution: AppState["payContribution"] = async (paymentId) => {
    const p = payments.find((x) => x.id === paymentId);
    if (!p || !supaUser) return;
    await supabase.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", paymentId);
    await supabase.from("activity").insert({
      circle_id: p.circleId, user_id: supaUser.id,
      type: "contribution",
      title: "Your contribution was received",
      meta: `${p.circleName} · ₦${p.amount.toLocaleString()}`,
    });
    await refresh();
  };

  const respondInvitation: AppState["respondInvitation"] = (id, action) => {
    setActivity((prev) => prev.map((a) => a.id === id && a.invite ? { ...a, invite: { ...a.invite, status: action } } : a));
  };

  const notifyUnpaid: AppState["notifyUnpaid"] = async (circleId) => {
    if (!supaUser) return 0;
    const circle = circles.find((c) => c.id === circleId);
    if (!circle || circle.role !== "admin") return 0;
    // Find pending/overdue member user_ids from DB
    const { data: unpaid } = await supabase
      .from("circle_members")
      .select("user_id, name")
      .eq("circle_id", circleId)
      .neq("status", "paid")
      .not("user_id", "is", null);
    const rows = (unpaid ?? []).filter((m) => m.user_id && m.user_id !== supaUser.id);
    if (rows.length === 0) {
      await supabase.from("activity").insert({
        circle_id: circleId, user_id: supaUser.id,
        type: "notified", title: "No unpaid members to notify", meta: circle.name,
      });
      await refresh();
      return 0;
    }
    await supabase.from("notifications").insert(rows.map((r) => ({
      user_id: r.user_id!, circle_id: circleId,
      kind: "reminder",
      title: `Payment reminder for ${circle.name}`,
      body: `Your contribution of ₦${circle.amount.toLocaleString()} is due (${circle.nextDue}).`,
    })));
    await supabase.from("activity").insert({
      circle_id: circleId, user_id: supaUser.id,
      type: "notified",
      title: `Reminders sent to ${rows.length} member${rows.length === 1 ? "" : "s"}`,
      meta: circle.name,
    });
    await refresh();
    return rows.length;
  };

  const markAllNotificationsRead: AppState["markAllNotificationsRead"] = async () => {
    if (!supaUser) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null).eq("user_id", supaUser.id);
    setNotifications((prev) => prev.map((n) => n.readAt ? n : { ...n, readAt: new Date().toISOString() }));
  };

  const updateProfile: AppState["updateProfile"] = async (patch) => {
    if (!supaUser) return;
    await supabase.from("profiles").update(patch).eq("id", supaUser.id);
    await refresh();
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const resetOnboarding = async () => {
    if (!supaUser) return;
    await supabase.from("profiles").update({ onboarded: false }).eq("id", supaUser.id);
    await refresh();
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.readAt).length, [notifications]);

  return (
    <AppCtx.Provider value={{
      loading, session, supaUser, user,
      circles, activity, payments, notifications, unreadCount,
      devMode, setDevMode,
      addCircle, payContribution, respondInvitation, notifyUnpaid,
      markAllNotificationsRead, updateProfile, refresh, signOut, resetOnboarding,
    }}>
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

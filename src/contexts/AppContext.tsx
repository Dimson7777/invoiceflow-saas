import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  date: string;
  dueDate: string;
  items: { description: string; quantity: number; price: number }[];
}

type Plan = "free" | "pro";

interface AppContextType {
  plan: Plan;
  setPlan: (p: Plan) => void;
  isPro: boolean;
  clients: Client[];
  clientsLoading: boolean;
  addClient: (c: Omit<Client, "id" | "createdAt">) => Promise<void>;
  updateClient: (id: string, c: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  invoices: Invoice[];
  invoicesLoading: boolean;
  addInvoice: (i: Omit<Invoice, "id" | "number">) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  canCreateInvoice: boolean;
  checkSubscription: () => Promise<void>;
  subscriptionLoading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const FREE_INVOICE_LIMIT = 3;

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [plan, setPlanState] = useState<Plan>("free");
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const setPlan = useCallback((p: Plan) => {
    setPlanState(p);
  }, []);

  const checkSubscription = useCallback(async () => {
    try {
      setSubscriptionLoading(true);
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) { console.error("Subscription check failed:", error); return; }
      setPlan(data?.subscribed ? "pro" : "free");
    } catch (err) {
      console.error("Subscription check error:", err);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [setPlan]);

  // Fetch clients from DB
  const fetchClients = useCallback(async () => {
    if (!isAuthenticated) return;
    setClientsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setClients((data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
        phone: c.phone,
        createdAt: c.created_at,
      })));
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setClientsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch invoices from DB
  const fetchInvoices = useCallback(async () => {
    if (!isAuthenticated) return;
    setInvoicesLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setInvoices((data || []).map((inv: any) => ({
        id: inv.id,
        number: inv.number,
        clientId: inv.client_id || "",
        clientName: inv.client_name,
        amount: Number(inv.amount),
        status: inv.status as "paid" | "pending" | "overdue",
        date: inv.date,
        dueDate: inv.due_date,
        items: (inv.invoice_items || []).map((it: any) => ({
          description: it.description,
          quantity: it.quantity,
          price: Number(it.price),
        })),
      })));
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    } finally {
      setInvoicesLoading(false);
    }
  }, [isAuthenticated]);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchClients(), fetchInvoices()]);
  }, [fetchClients, fetchInvoices]);

  // Load data on auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
      fetchInvoices();
      checkSubscription();
    } else {
      setClients([]);
      setInvoices([]);
      setPlanState("free");
    }
  }, [isAuthenticated, fetchClients, fetchInvoices, checkSubscription]);

  // Re-sync on visibility change
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        checkSubscription();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isAuthenticated, checkSubscription]);

  // Periodic subscription check
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(checkSubscription, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, checkSubscription]);

  // --- CRUD operations ---

  const addClient = useCallback(async (c: Omit<Client, "id" | "createdAt">) => {
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase.from("clients").insert({
      user_id: user.id,
      name: c.name,
      email: c.email,
      company: c.company,
      phone: c.phone,
    });
    if (error) throw error;
    await fetchClients();
  }, [user, fetchClients]);

  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    const updateData: Record<string, string> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.phone !== undefined) updateData.phone = data.phone;
    const { error } = await supabase.from("clients").update(updateData).eq("id", id);
    if (error) throw error;
    await fetchClients();
  }, [fetchClients]);

  const deleteClient = useCallback(async (id: string) => {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
    await fetchClients();
  }, [fetchClients]);

  const addInvoice = useCallback(async (i: Omit<Invoice, "id" | "number">) => {
    if (!user) throw new Error("Not authenticated");
    // Get next invoice number
    const { data: numData } = await supabase.rpc("next_invoice_number", { p_user_id: user.id });
    const number = numData || `INV-${Date.now()}`;

    const { data: inv, error } = await supabase.from("invoices").insert({
      user_id: user.id,
      number,
      client_id: i.clientId || null,
      client_name: i.clientName,
      amount: i.amount,
      status: i.status,
      date: i.date,
      due_date: i.dueDate,
    }).select("id").single();
    if (error) throw error;

    // Insert items
    if (i.items.length > 0 && inv) {
      const { error: itemsError } = await supabase.from("invoice_items").insert(
        i.items.map((item) => ({
          invoice_id: inv.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        }))
      );
      if (itemsError) throw itemsError;
    }
    await fetchInvoices();
  }, [user, fetchInvoices]);

  const updateInvoiceStatus = useCallback(async (id: string, status: Invoice["status"]) => {
    const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
    if (error) throw error;
    // Optimistic update
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status } : inv));
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) throw error;
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  }, []);

  const isPro = plan === "pro";
  const canCreateInvoice = isPro || invoices.length < FREE_INVOICE_LIMIT;

  return (
    <AppContext.Provider value={{
      plan, setPlan, isPro,
      clients, clientsLoading, addClient, updateClient, deleteClient,
      invoices, invoicesLoading, addInvoice, updateInvoiceStatus, deleteInvoice,
      canCreateInvoice, checkSubscription, subscriptionLoading, refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

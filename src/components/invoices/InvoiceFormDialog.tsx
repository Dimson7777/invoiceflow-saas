import { useState, useMemo } from "react";
import { useApp, type Client } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceFormDialog({ open, onOpenChange }: Props) {
  const { addInvoice, clients, canCreateInvoice } = useApp();
  const [form, setForm] = useState({ clientId: "", description: "", quantity: "1", price: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const total = useMemo(() => (Number(form.quantity) || 0) * (Number(form.price) || 0), [form.quantity, form.price]);

  const isValid = form.clientId && form.description.trim() && form.price && Number(form.price) > 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.clientId) e.clientId = "Select a client";
    if (!form.description.trim()) e.description = "Add a description";
    if (!form.price || Number(form.price) <= 0) e.price = "Enter a valid price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const client = clients.find((c) => c.id === form.clientId);
    if (!client) return;
    setSaving(true);
    try {
      await addInvoice({
        clientId: form.clientId,
        clientName: client.company || client.name,
        amount: total,
        status: "pending",
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        items: [{ description: form.description, quantity: Number(form.quantity), price: Number(form.price) }],
      });
      toast.success("Invoice created");
      setForm({ clientId: "", description: "", quantity: "1", price: "" });
      setErrors({});
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  if (!canCreateInvoice) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-3">
        <Crown className="h-4 w-4 text-primary shrink-0" />
        <p className="text-xs text-muted-foreground">Invoice limit reached.</p>
        <Link to="/dashboard/billing">
          <Button size="sm" variant="outline">Upgrade</Button>
        </Link>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setErrors({}); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New invoice
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New invoice</DialogTitle>
        </DialogHeader>
        {clients.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">You need to add a client first.</p>
            <Link to="/dashboard/clients">
              <Button variant="outline" size="sm">Go to Clients</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={form.clientId} onValueChange={(v) => { setForm({ ...form, clientId: v }); if (errors.clientId) setErrors({ ...errors, clientId: "" }); }}>
                <SelectTrigger className={errors.clientId ? "border-destructive" : ""}><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-xs text-destructive">{errors.clientId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => { setForm({ ...form, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: "" }); }}
                placeholder="e.g. Website redesign"
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Qty</Label>
                <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Unit price ($)</Label>
                <Input
                  type="number" min="0" step="0.01"
                  value={form.price}
                  onChange={(e) => { setForm({ ...form, price: e.target.value }); if (errors.price) setErrors({ ...errors, price: "" }); }}
                  placeholder="0.00"
                  className={errors.price ? "border-destructive" : ""}
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <Button type="submit" className="w-full" disabled={saving || !isValid}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create invoice
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

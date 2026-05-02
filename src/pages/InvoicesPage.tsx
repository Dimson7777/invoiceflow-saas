import { useState } from "react";
import { useApp, type Invoice } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Trash2, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { StatusBadge } from "@/components/invoices/StatusBadge";
import { InvoiceFormDialog } from "@/components/invoices/InvoiceFormDialog";
import { generateInvoicePdf } from "@/components/invoices/generateInvoicePdf";
import { MobileActionButton } from "@/components/MobileActionButton";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function InvoicesPage() {
  const { invoices, invoicesLoading, updateInvoiceStatus, deleteInvoice, canCreateInvoice } = useApp();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = invoices.filter((i) => {
    const matchesSearch = i.number.toLowerCase().includes(search.toLowerCase()) || i.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInvoice(deleteTarget);
      toast.success("Invoice deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateInvoiceStatus(id, status as "paid" | "pending" | "overdue");
      toast.success(`Marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  if (invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <div className="flex gap-3">
            <div className="skeleton h-9 w-40" />
            <div className="skeleton h-9 w-24" />
          </div>
          <div className="skeleton h-9 w-32" />
        </div>
        <Card className="overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="skeleton h-3.5 w-20" />
                <div className="skeleton h-3.5 w-24" />
                <div className="skeleton h-3.5 w-16" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-xs" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="hidden sm:block">
          <InvoiceFormDialog open={open} onOpenChange={setOpen} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/50 backdrop-blur-sm py-16 px-8 overflow-hidden gap-4 animate-fade-in transition-all duration-300 hover:border-primary/30 hover:shadow-md">
          {/* Glow blob */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-40 rounded-full bg-primary/5 blur-3xl animate-glow-pulse" />
          </div>
          {/* Floating icon */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border/60 empty-icon-float">
            <FileText className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <div className="relative text-center space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              {invoices.length === 0 ? "No invoices yet" : "No matching invoices"}
            </p>
            <p className="text-xs text-muted-foreground">
              {invoices.length === 0
                ? "Create your first invoice to start getting paid."
                : "Try a different search or filter."}
            </p>
          </div>
          {invoices.length === 0 && (
            <Button
              size="sm"
              className="relative mt-1 animate-pulse-soft transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_14px_hsl(var(--primary)/0.35)] hover:[animation-play-state:paused]"
              onClick={() => setOpen(true)}
            >
              Create your first invoice
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden sm:block overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[90px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv.id} className="group">
                    <TableCell className="font-medium">{inv.number}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.clientName}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{formatDate(inv.date)}</TableCell>
                    <TableCell className="font-semibold">${inv.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Select value={inv.status} onValueChange={(v) => handleStatusChange(inv.id, v)}>
                        <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0">
                          <StatusBadge status={inv.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => generateInvoicePdf(inv)} title="Download">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(inv.id)} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2">
            {filtered.map((inv) => (
              <Card key={inv.id}>
                <CardContent className="py-3.5 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-card-foreground">{inv.number}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{inv.clientName}</span>
                    <span>{formatDate(inv.date)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-sm font-semibold">${inv.amount.toLocaleString()}</p>
                    <div className="flex gap-0.5">
                      <Select value={inv.status} onValueChange={(v) => handleStatusChange(inv.id, v)}>
                        <SelectTrigger className="h-7 w-[90px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => generateInvoicePdf(inv)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(inv.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {canCreateInvoice && <MobileActionButton onClick={() => setOpen(true)} label="New invoice" />}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        title="Delete invoice?"
        description="This invoice will be permanently removed."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

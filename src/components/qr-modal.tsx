import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

/** Simple QR pattern rendered from an SVG grid seeded by the string. */
function QRArt({ value, size = 220 }: { value: string; size?: number }) {
  const grid = 25;
  // deterministic hash to pattern
  const cells: boolean[] = [];
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
  for (let i = 0; i < grid * grid; i++) {
    h = (h * 1103515245 + 12345) | 0;
    cells.push(((h >>> 16) & 1) === 1);
  }
  const s = size / grid;
  const finder = (x: number, y: number) => (
    <g key={`f-${x}-${y}`}>
      <rect x={x * s} y={y * s} width={s * 7} height={s * 7} fill="#0F1226" />
      <rect x={(x + 1) * s} y={(y + 1) * s} width={s * 5} height={s * 5} fill="#fff" />
      <rect x={(x + 2) * s} y={(y + 2) * s} width={s * 3} height={s * 3} fill="#0F1226" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-xl bg-white">
      {cells.map((on, i) => {
        const x = i % grid;
        const y = Math.floor(i / grid);
        // reserve finder patterns 7x7 in three corners
        const inFinder =
          (x < 8 && y < 8) ||
          (x > grid - 9 && y < 8) ||
          (x < 8 && y > grid - 9);
        if (inFinder || !on) return null;
        return <rect key={i} x={x * s} y={y * s} width={s} height={s} fill="#0F1226" />;
      })}
      {finder(0, 0)}
      {finder(grid - 7, 0)}
      {finder(0, grid - 7)}
    </svg>
  );
}

export function QRModal({
  open,
  onOpenChange,
  title = "Nomba Virtual Account",
  value,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  value?: string;
}) {
  const { user } = useApp();
  const payload = value ?? `kolo:pay?bank=Nomba&acct=${user.virtualAccount.number}&name=${encodeURIComponent(user.virtualAccount.name)}`;
  const copy = () => { navigator.clipboard.writeText(user.virtualAccount.number); toast.success("Account number copied"); };
  const share = async () => {
    const text = `Send to my KOLO / Nomba account\n${user.virtualAccount.name}\nAcct: ${user.virtualAccount.number}`;
    if (navigator.share) {
      try { await navigator.share({ title: "KOLO Virtual Account", text }); } catch { /* ignore */ }
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Details copied to share");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px] rounded-3xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 pt-1">
          <div className="rounded-2xl border border-border bg-white p-3 shadow-soft">
            <QRArt value={payload} size={220} />
          </div>
          <div className="w-full rounded-2xl bg-primary-pale p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Powered by Nomba</p>
            <p className="mt-1 text-2xl font-bold tracking-widest text-foreground">{user.virtualAccount.number}</p>
            <p className="text-xs font-semibold text-muted-foreground">{user.virtualAccount.name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{user.virtualAccount.bank}</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-3">
            <button onClick={copy} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold">
              <Copy className="h-4 w-4" /> Copy
            </button>
            <button onClick={share} className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-btn">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

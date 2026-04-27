import logoSrc from "@/assets/logo.png";

interface Props {
  collapsed?: boolean;
  size?: "sm" | "md";
}

export function Logo({ collapsed, size = "md" }: Props) {
  const imgSize = size === "sm" ? 20 : 24;

  if (collapsed) {
    return <img src={logoSrc} alt="InvoiceFlow" width={imgSize} height={imgSize} className="shrink-0" />;
  }

  return (
    <span className="flex items-center gap-2">
      <img src={logoSrc} alt="" width={imgSize} height={imgSize} className="shrink-0" />
      <span className={`font-bold tracking-tight ${size === "sm" ? "text-base" : "text-lg"}`}>
        <span className="text-primary">Invoice</span>
        <span className="text-foreground">Flow</span>
      </span>
    </span>
  );
}

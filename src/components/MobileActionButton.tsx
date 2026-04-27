import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onClick: () => void;
  label?: string;
}

export function MobileActionButton({ onClick, label = "New" }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 sm:hidden">
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-elevated p-0"
        onClick={onClick}
        aria-label={label}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

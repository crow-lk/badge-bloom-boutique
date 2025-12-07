import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type SocialProvider } from "@/lib/auth";
import { Chrome, Facebook, type LucideIcon } from "lucide-react";

type SocialAuthButtonsProps = {
  label?: string;
  onSelect?: (provider: SocialProvider) => void;
  loadingProvider?: SocialProvider | null;
  disabled?: boolean;
};

const providers: { name: string; icon: LucideIcon; value: SocialProvider }[] = [
  { name: "Google", icon: Chrome, value: "google" },
  { name: "Facebook", icon: Facebook, value: "facebook" },
];

const SocialAuthButtons = ({
  label = "Or continue with",
  onSelect,
  loadingProvider,
  disabled,
}: SocialAuthButtonsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
        <Separator className="flex-1" />
        <span>{label}</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map(({ name, icon: Icon, value }) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            className="w-full justify-center gap-2"
            disabled={disabled || loadingProvider === value}
            onClick={() => onSelect?.(value)}
          >
            <Icon className={loadingProvider === value ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            <span className="text-sm">{loadingProvider === value ? "Connecting..." : name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SocialAuthButtons;

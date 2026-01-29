import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/auth";

type WelcomePopupSettings = {
  image_path?: string;
  image_url?: string;
  description?: string;
  link_url?: string;
};

const STORAGE_KEY = "aaliyaa.welcome-popup.seen";
const SETTINGS_PATH = "/api/settings/welcome-popup";

const hasContent = (settings: WelcomePopupSettings | null) => {
  if (!settings) return false;
  const hasImage = Boolean(settings.image_url || settings.image_path);
  const hasText = Boolean(settings.description && settings.description.trim());
  return hasImage || hasText;
};

const resolveImageUrl = (settings: WelcomePopupSettings | null) => {
  if (!settings) return null;
  const raw = settings.image_url || settings.image_path;
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return `${API_BASE_URL}${raw}`;
  return `${API_BASE_URL}/storage/${raw}`;
};

const WelcomePopup = () => {
  const [settings, setSettings] = useState<WelcomePopupSettings | null>(null);
  const [open, setOpen] = useState(false);

  const imageUrl = useMemo(() => resolveImageUrl(settings), [settings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    const controller = new AbortController();

    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${SETTINGS_PATH}`, {
          signal: controller.signal,
        });

        if (!response.ok) return;

        const payload: unknown = await response.json();
        const normalized = (payload as { data?: WelcomePopupSettings; settings?: WelcomePopupSettings }) ?? {};
        const data = normalized.data ?? normalized.settings ?? (payload as WelcomePopupSettings);

        if (!hasContent(data)) return;

        setSettings(data);
        setOpen(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("Unable to load welcome popup settings.", error);
      }
    };

    loadSettings();

    return () => controller.abort();
  }, []);

  const markSeen = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      markSeen();
    }
  };

  if (!hasContent(settings)) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[520px] overflow-hidden p-0">
        {imageUrl && (
          <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
            <img src={imageUrl} alt="Welcome" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="space-y-4 p-6 text-center">
          {settings?.description && <p className="text-sm text-muted-foreground">{settings.description}</p>}
          {settings?.link_url ? (
            <Button asChild onClick={() => handleOpenChange(false)}>
              <a href={settings.link_url}>Learn more</a>
            </Button>
          ) : (
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;

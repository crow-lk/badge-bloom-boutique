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
      <DialogContent className="h-[100dvh] w-screen max-w-screen overflow-hidden p-0 sm:h-auto sm:max-h-[85vh] sm:w-[min(90vw,640px)] sm:max-w-[min(90vw,640px)] [&>button]:z-10 [&>button]:rounded-full [&>button]:bg-background/80 [&>button]:text-foreground [&>button]:backdrop-blur-sm [&>button]:hover:bg-background">
        {imageUrl ? (
          <div className="relative h-full w-full">
            <img src={imageUrl} alt="Welcome" className="block h-full w-full object-cover sm:max-h-[70vh]" />
            <div className="absolute inset-x-0 bottom-0 space-y-4 bg-background/80 p-6 text-center text-foreground backdrop-blur-sm sm:static sm:bg-transparent sm:p-6 sm:text-center sm:backdrop-blur-0">
              {settings?.description && <p className="text-sm text-muted-foreground">{settings.description}</p>}
              {settings?.link_url ? (
                <Button asChild onClick={() => handleOpenChange(false)}>
                  <a href={settings.link_url}>Buy now</a>
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-6 text-center">
            {settings?.description && <p className="text-sm text-muted-foreground">{settings.description}</p>}
            {settings?.link_url ? (
              <Button asChild onClick={() => handleOpenChange(false)}>
                <a href={settings.link_url}>Buy now</a>
              </Button>
            ) : (
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
      <DialogContent className="h-[100dvh] w-screen max-w-screen overflow-hidden p-0 sm:h-auto sm:max-h-[85vh] sm:w-[min(90vw,640px)] sm:max-w-[min(90vw,640px)] bg-transparent border-none shadow-none">
        <button className="fixed right-4 top-6 z-50 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm hover:bg-background sm:absolute sm:right-4 sm:top-4 sm:bottom-auto" onClick={() => handleOpenChange(false)}>
          <X className="h-5 w-5" />
        </button>
        {imageUrl ? (
          <div className="flex flex-col h-full w-full items-center justify-center">
            <div className="flex h-full w-full items-center justify-center">
              <img
                src={imageUrl}
                alt="Welcome"
                className="block max-h-[55vh] max-w-[90vw] object-contain sm:max-h-[50vh] sm:max-w-[520px]"
              />
            </div>
            <div className="w-full space-y-4 px-6 pb-6 text-center">
              {settings?.description && <p className="text-sm text-muted-foreground">{settings.description}</p>}
              {settings?.link_url && (
                <Button asChild onClick={() => handleOpenChange(false)}>
                  <a href={settings.link_url}>Buy now</a>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-6 text-center">
            {settings?.description && <p className="text-sm text-muted-foreground">{settings.description}</p>}
            {settings?.link_url && (
              <Button asChild onClick={() => handleOpenChange(false)}>
                <a href={settings.link_url}>Buy now</a>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;

import { API_BASE_URL } from "@/lib/auth";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const FACEBOOK_SCRIPT_SRC = "https://connect.facebook.net/en_US/sdk.js";
const FACEBOOK_SDK_VERSION = "v19.0";
const WAIT_TIMEOUT_MS = 10000;

const SOCIAL_SETTINGS_PATH = (import.meta.env.VITE_SOCIAL_SETTINGS_PATH ?? "/api/settings/social-login").trim();

type SocialSettings = {
  googleClientId?: string;
  facebookAppId?: string;
};

let googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();
let facebookAppId = (import.meta.env.VITE_FACEBOOK_APP_ID ?? "").trim();
let socialSettingsPromise: Promise<void> | null = null;
let socialSettingsLoaded = false;

const stringValue = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const parseSocialSettings = (payload: unknown): SocialSettings => {
  const root = asRecord(payload);
  const data = asRecord(root.data ?? root.settings ?? root);
  const providers = asRecord(data.providers);
  const googleSection = {
    ...asRecord(data.google),
    ...asRecord(data.google_oauth),
    ...asRecord(providers.google),
  };
  const facebookSection = {
    ...asRecord(data.facebook),
    ...asRecord(data.facebook_oauth),
    ...asRecord(providers.facebook),
  };

  const resolvedGoogleClientId =
    stringValue(data.google_client_id) ??
    stringValue(data.googleClientId) ??
    stringValue(googleSection.client_id) ??
    stringValue(googleSection.clientId) ??
    stringValue(googleSection.app_id);

  const resolvedFacebookAppId =
    stringValue(data.facebook_app_id) ??
    stringValue(data.facebookAppId) ??
    stringValue(facebookSection.app_id) ??
    stringValue(facebookSection.appId) ??
    stringValue(facebookSection.client_id);

  return {
    googleClientId: resolvedGoogleClientId,
    facebookAppId: resolvedFacebookAppId,
  };
};

const applySocialSettings = (settings: SocialSettings) => {
  if (settings.googleClientId) {
    googleClientId = settings.googleClientId;
  }
  if (settings.facebookAppId) {
    facebookAppId = settings.facebookAppId;
  }
};

const buildSocialSettingsUrl = () => {
  if (!SOCIAL_SETTINGS_PATH) return null;
  if (SOCIAL_SETTINGS_PATH.startsWith("http://") || SOCIAL_SETTINGS_PATH.startsWith("https://")) {
    return SOCIAL_SETTINGS_PATH;
  }
  return `${API_BASE_URL}${SOCIAL_SETTINGS_PATH}`;
};

const hydrateSocialSettings = async () => {
  if (socialSettingsLoaded) return;
  const settingsUrl = buildSocialSettingsUrl();
  if (!settingsUrl) return;
  if (typeof window === "undefined" || typeof fetch === "undefined") return;
  if (!socialSettingsPromise) {
    socialSettingsPromise = (async () => {
      try {
        const response = await fetch(settingsUrl);
        if (!response.ok) {
          return;
        }
        const payload = await response.json().catch(() => null);
        applySocialSettings(parseSocialSettings(payload));
        socialSettingsLoaded = true;
      } catch (error) {
        console.warn("Unable to load social login settings.", error);
      } finally {
        socialSettingsPromise = null;
      }
    })();
  }
  await socialSettingsPromise;
};

const resolveGoogleClientId = async () => {
  if (!googleClientId) {
    await hydrateSocialSettings();
  }
  if (!googleClientId) {
    throw new Error("Google login is not configured.");
  }
  return googleClientId;
};

const resolveFacebookAppId = async () => {
  if (!facebookAppId) {
    await hydrateSocialSettings();
  }
  if (!facebookAppId) {
    throw new Error("Facebook login is not configured.");
  }
  return facebookAppId;
};

const ensureBrowserEnv = () => {
  if (typeof window === "undefined") {
    throw new Error("Social logins are only available in the browser.");
  }
};

const ensureScriptTag = (src: string, configure?: (tag: HTMLScriptElement) => void) => {
  if (typeof document === "undefined") return;
  let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (!script) {
    script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    configure?.(script);
    document.head.appendChild(script);
  }
};

const waitForGlobal = <T>(getter: () => T | undefined, errorMessage: string, timeoutMs = WAIT_TIMEOUT_MS) =>
  new Promise<T>((resolve, reject) => {
    ensureBrowserEnv();

    const existing = getter();
    if (existing) {
      resolve(existing);
      return;
    }

    const interval = window.setInterval(() => {
      const value = getter();
      if (value) {
        window.clearInterval(interval);
        window.clearTimeout(timeout);
        resolve(value);
      }
    }, 50);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

const ensureGoogleClient = async () => {
  ensureBrowserEnv();
  ensureScriptTag(GOOGLE_SCRIPT_SRC);
  return waitForGlobal(() => (window.google?.accounts ? window.google : undefined), "Google SDK failed to load.");
};

const ensureFacebookClient = async () => {
  ensureBrowserEnv();
  ensureScriptTag(FACEBOOK_SCRIPT_SRC, (tag) => {
    tag.crossOrigin = "anonymous";
  });
  return waitForGlobal(() => window.FB, "Facebook SDK failed to load.");
};

let facebookInitPromise: Promise<FacebookSDK> | null = null;

const getFacebookSdk = () => {
  if (facebookInitPromise) return facebookInitPromise;

  facebookInitPromise = (async () => {
    const appId = await resolveFacebookAppId();
    const FB = await ensureFacebookClient();
    FB.init({
      appId,
      cookie: true,
      xfbml: false,
      version: FACEBOOK_SDK_VERSION,
    });
    return FB;
  })().catch((error) => {
    facebookInitPromise = null;
    throw error;
  });

  return facebookInitPromise;
};

export const requestGoogleAccessToken = async (): Promise<string> => {
  const google = await ensureGoogleClient();
  const clientId = await resolveGoogleClientId();

  return new Promise<string>((resolve, reject) => {
    const oauth2 = google.accounts?.oauth2;
    if (!oauth2?.initTokenClient) {
      reject(new Error("Google OAuth SDK is unavailable. Please try again later."));
      return;
    }

    let settled = false;

    const finishWithError = (message: string) => {
      if (settled) return;
      settled = true;
      reject(new Error(message));
    };

    const finishWithToken = (token: string) => {
      if (settled) return;
      settled = true;
      resolve(token);
    };

    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      prompt: "consent",
      callback: (response) => {
        if (response?.error) {
          finishWithError(response.error_description ?? response.error);
          return;
        }
        const token = response?.access_token;
        if (!token) {
          finishWithError("Google sign-in did not return an access token. Please try again.");
          return;
        }
        finishWithToken(token);
      },
      error_callback: (error) => {
        const message = error?.error_description ?? error?.error ?? "Google sign-in was cancelled.";
        finishWithError(message);
      },
    });

    try {
      tokenClient.requestAccessToken();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to start Google sign-in. Please try again.";
      finishWithError(message);
    }
  });
};

export const requestFacebookAccessToken = async (): Promise<string> => {
  const FB = await getFacebookSdk();

  return new Promise<string>((resolve, reject) => {
    FB.login(
      (response) => {
        const token = response?.authResponse?.accessToken;
        if (token) {
          resolve(token);
          return;
        }

        if (response?.status === "not_authorized") {
          reject(new Error("Facebook login was denied. Please grant access to continue."));
          return;
        }

        reject(new Error("Facebook sign-in was cancelled."));
      },
      { scope: "email" },
    );
  });
};

/// <reference types="vite/client" />

declare global {
  interface Window {
    google?: typeof google;
    FB?: FacebookSDK;
  }

  namespace google {
    namespace accounts {
      namespace id {
        type CredentialCallback = (response: CredentialResponse) => void;

        interface CredentialResponse {
          clientId?: string;
          credential?: string;
          select_by?: string;
        }

        interface PromptMomentNotification {
          isMomentMoment(): boolean;
          isFinalMoment(): boolean;
          getNotDisplayedReason(): string;
          getSkippedReason(): string;
          isDismissedMoment(): boolean;
          isNotDisplayed(): boolean;
          isSkippedMoment(): boolean;
        }

        interface InitializeOptions {
          client_id: string;
          callback: CredentialCallback;
          ux_mode?: "popup" | "redirect";
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }

        function initialize(options: InitializeOptions): void;
        function prompt(callback?: (notification: PromptMomentNotification) => void): void;
        function renderButton(parent: HTMLElement, options?: Record<string, unknown>): void;
        function cancel(): void;
      }
    }
  }

  type FacebookLoginStatus = "connected" | "not_authorized" | "unknown";

  type FacebookAuthResponse = {
    accessToken: string;
    userID: string;
    expiresIn: number;
    signedRequest: string;
    graphDomain?: string;
    data_access_expiration_time?: number;
  };

  type FacebookLoginResponse = {
    status?: FacebookLoginStatus;
    authResponse?: FacebookAuthResponse;
  };

  interface FacebookSDK {
    init(config: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }): void;
    login(
      callback: (response: FacebookLoginResponse) => void,
      options?: {
        scope?: string;
        auth_type?: string;
      },
    ): void;
    getLoginStatus(callback: (response: FacebookLoginResponse) => void): void;
  }
}

export {};

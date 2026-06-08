import { useEffect, useMemo, useState, type ComponentProps } from "react";

import {
  AuthRequestError,
  getAuthErrorMessage,
  getOAuthErrorMessage,
  submitEmailAuth,
  type AuthEndpoint,
} from "./authClient";

type AuthMode = "login" | "register";

type AuthScreenProps = {
  mode: AuthMode;
};

type AuthConfig = {
  eyebrow: string;
  title: string;
  endpoint: AuthEndpoint;
  submitLabel: string;
  pendingLabel: string;
  passwordMinLength?: number;
  alternatePrompt: string;
  alternateHref: string;
  alternateLabel: string;
};

const AUTH_CONFIG: Record<AuthMode, AuthConfig> = {
  login: {
    eyebrow: "Sign in to your account",
    title: "Financier",
    endpoint: "/api/auth/login",
    submitLabel: "Sign in",
    pendingLabel: "Signing in...",
    alternatePrompt: "Don't have an account?",
    alternateHref: "/register",
    alternateLabel: "Register",
  },
  register: {
    eyebrow: "Create your account",
    title: "Financier",
    endpoint: "/api/auth/register",
    submitLabel: "Sign up",
    pendingLabel: "Creating account...",
    passwordMinLength: 8,
    alternatePrompt: "Already have an account?",
    alternateHref: "/login",
    alternateLabel: "Sign in",
  },
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const config = AUTH_CONFIG[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"email" | "google" | null>(
    null,
  );
  const disabled = pendingAction !== null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "error") {
      setError(getOAuthErrorMessage(params.get("message")));
    }
  }, []);

  const passwordHint = useMemo(() => {
    if (!config.passwordMinLength) return null;
    return `Use at least ${config.passwordMinLength} characters.`;
  }, [config.passwordMinLength]);

  const handleSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (
      config.passwordMinLength &&
      password.length < config.passwordMinLength
    ) {
      setError(
        `Password must be at least ${config.passwordMinLength} characters.`,
      );
      return;
    }

    setPendingAction("email");
    setError(null);

    try {
      await submitEmailAuth(config.endpoint, { email, password });
      window.location.assign("/dashboard");
    } catch (requestError) {
      if (requestError instanceof AuthRequestError) {
        setError(getAuthErrorMessage(requestError.code, requestError.message));
      } else {
        setError("Authentication failed. Please try again.");
      }
      setPendingAction(null);
    }
  };

  const handleGoogle = () => {
    setPendingAction("google");
    setError(null);
    window.location.assign("/api/auth/google");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="headline-lg text-primary">{config.title}</h1>
          <p className="body-lg text-muted-foreground">{config.eyebrow}</p>
        </div>

        {error && (
          <div
            className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="label-md" htmlFor={`${mode}-email`}>
              Email
            </label>
            <input
              id={`${mode}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              disabled={disabled}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="label-md" htmlFor={`${mode}-password`}>
              Password
            </label>
            <input
              id={`${mode}-password`}
              name="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={config.passwordMinLength}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              disabled={disabled}
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Password"
              aria-describedby={
                passwordHint ? `${mode}-password-hint` : undefined
              }
            />
            {passwordHint && (
              <p
                id={`${mode}-password-hint`}
                className="text-xs text-muted-foreground"
              >
                {passwordHint}
              </p>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={disabled}>
            {pendingAction === "email" && <SpinnerIcon className="size-4" />}
            {pendingAction === "email"
              ? config.pendingLabel
              : config.submitLabel}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line">
            <span />
          </div>
          <div className="auth-divider-label">
            <span>Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          className="auth-oauth"
          onClick={handleGoogle}
          disabled={disabled}
        >
          {pendingAction === "google" ? (
            <SpinnerIcon className="size-5" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {config.alternatePrompt}{" "}
          <a
            href={config.alternateHref}
            className="text-primary hover:underline"
          >
            {config.alternateLabel}
          </a>
        </p>

        <div className="flex justify-center mt-5">
          <AuthThemeToggle />
        </div>
      </div>
    </div>
  );
}

function AuthThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const handleToggle = () => {
    if (window.toggleTheme) {
      window.toggleTheme();
    } else {
      const html = document.documentElement;
      const next =
        html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    }
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  };

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label="Toggle theme"
      onClick={handleToggle}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function AlertIcon() {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className: string }) {
  return (
    <svg
      className={`${className} animate-spin`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20.99 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.78 9.79z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

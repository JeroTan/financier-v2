import { useState, useEffect } from "react";
import { PersonalitySelector } from "./PersonalitySelector";
import { Skeleton } from "@/components/ui/skeleton";

type SettingsPanelProps = {
  token?: string;
};

export default function SettingsPanel({ token }: SettingsPanelProps) {
  const [personality, setPersonality] = useState<string>("default");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings", {
      credentials: "same-origin",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => res.json() as Promise<{ success: boolean; data: { personality?: string; email?: string } }>)
      .then((data) => {
        if (data.success) {
          setPersonality(data.data.personality || "default");
          setEmail(data.data.email || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handlePersonalityChange = async (personality: string) => {
    const response = await fetch("/api/settings/preferences", {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ personality }),
    });

    if (!response.ok) {
      throw new Error("Failed to update personality");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <section className="rounded-lg border border-chat-border bg-surface-container-lowest p-6 shadow-card">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-5 w-64" />
        </section>
        <section className="rounded-lg border border-chat-border bg-surface-container-lowest p-6 shadow-card">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
      <header className="space-y-2">
        <p className="label-md text-primary">Preferences</p>
        <h1 className="headline-lg text-on-surface">Settings</h1>
      </header>

      <section className="rounded-lg border border-chat-border bg-surface-container-lowest p-6 shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label-md text-on-surface-variant">Account</p>
            <p className="mt-2 text-base font-semibold text-on-surface">{email || "User"}</p>
          </div>
          <span className="w-fit rounded-full border border-outline-variant px-3 py-1 text-sm text-on-surface-variant">
            Signed in
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-chat-border bg-surface-container-lowest p-6 shadow-card">
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="headline-md text-on-surface">AI Personality</h2>
          <p className="max-w-2xl text-sm text-on-surface-variant">
            Choose how your AI assistant communicates with you. Changes apply to new conversations.
          </p>
        </div>
        <PersonalitySelector
          currentPersonality={personality}
          onSelect={handlePersonalityChange}
        />
      </section>
    </div>
  );
}

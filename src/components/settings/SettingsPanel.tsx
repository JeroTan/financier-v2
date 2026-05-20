import { useState, useEffect } from "react";
import { PersonalitySelector } from "./PersonalitySelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type SettingsPanelProps = {
  token: string;
};

export default function SettingsPanel({ token }: SettingsPanelProps) {
  const [personality, setPersonality] = useState<string>("default");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings", {
      headers: { Authorization: `Bearer ${token}` },
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ personality }),
    });

    if (!response.ok) {
      throw new Error("Failed to update personality");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="headline-lg">Settings</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="headline-lg">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{email}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Personality</CardTitle>
          <CardDescription>
            Choose how your AI assistant communicates with you. Changes apply to new conversations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalitySelector
            currentPersonality={personality}
            onSelect={handlePersonalityChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

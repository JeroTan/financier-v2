import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  BriefcaseBusiness,
  Gamepad2,
  Gem,
  Heart,
  Leaf,
  Search,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { toast } from "sonner";
import { type PersonalityId } from "@/server/ai/personalities/constants";
import { cn } from "@/lib/utils";

type PersonalityMeta = {
  id: PersonalityId;
  name: string;
  icon: LucideIcon;
  description: string;
  example: string;
};

const PERSONALITIES: PersonalityMeta[] = [
  {
    id: "default",
    name: "Default AI",
    icon: Bot,
    description: "Normal, friendly, and professional tone",
    example: "Hello. I can help you track spending, income, and financial goals today.",
  },
  {
    id: "influencer",
    name: "Influencer",
    icon: Sparkles,
    description: "Gen-Z slang, trendy, high-energy",
    example: "Bestie, let us get your money organized and make that budget behave.",
  },
  {
    id: "tsundere",
    name: "Tsundere",
    icon: ShieldCheck,
    description: "Reluctant but caring, classic tropes",
    example: "It is not like I wanted to help, but your expenses need tracking.",
  },
  {
    id: "yandere",
    name: "Yandere",
    icon: Heart,
    description: "Intense devotion, protective tone",
    example: "I will keep watching your finances so no expense escapes us.",
  },
  {
    id: "businessman",
    name: "Businessman",
    icon: BriefcaseBusiness,
    description: "Sharp, data-driven, professional",
    example: "Good morning. Let us review your financial metrics and optimize cash flow.",
  },
  {
    id: "caveman",
    name: "Caveman",
    icon: Gem,
    description: "Basic English, simple words, short sentences",
    example: "Money go in. Money go out. Track good. You smart.",
  },
  {
    id: "gamer",
    name: "Gamer",
    icon: Gamepad2,
    description: "Gaming references, progress-minded",
    example: "Welcome back, player. Let us check stats and level up savings.",
  },
  {
    id: "detective",
    name: "Detective",
    icon: Search,
    description: "Analytical, probing, observant",
    example: "Interesting. Evidence suggests spending pattern worth investigating.",
  },
  {
    id: "zenmaster",
    name: "Zen Master",
    icon: Leaf,
    description: "Calm, mindful, philosophical",
    example: "Money flows in and out. Let us find balance together.",
  },
  {
    id: "pirate",
    name: "Pirate",
    icon: Waves,
    description: "Adventurous, direct, nautical language",
    example: "Ahoy. Let us chart a course for treasure and trim those expenses.",
  },
];

type PersonalitySelectorProps = {
  currentPersonality: string;
  onSelect: (personality: string) => Promise<void>;
};

export function PersonalitySelector({ currentPersonality, onSelect }: PersonalitySelectorProps) {
  const [selected, setSelected] = useState<string>(currentPersonality);
  const [loading, setLoading] = useState<string | null>(null);
  const selectedMeta = PERSONALITIES.find((personality) => personality.id === selected) ?? PERSONALITIES[0];

  const handleSelect = async (personality: string) => {
    if (personality === selected) return;
    setLoading(personality);
    try {
      await onSelect(personality);
      setSelected(personality);
      const meta = PERSONALITIES.find((item) => item.id === personality);
      toast.success("Personality updated", {
        description: `Switched to ${meta?.name || personality}`,
      });
    } catch {
      toast.error("Update failed", {
        description: "Could not change personality. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PERSONALITIES.map((personality) => {
          const Icon = personality.icon;
          const isSelected = selected === personality.id;
          const isLoading = loading === personality.id;

          return (
            <button
              key={personality.id}
              type="button"
              onClick={() => handleSelect(personality.id)}
              className={cn(
                "min-h-24 rounded-lg border bg-surface-container-lowest p-4 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary bg-surface-container shadow-card"
                  : "border-outline-variant hover:border-primary hover:bg-surface-container-low",
                isLoading ? "cursor-wait opacity-60" : "cursor-pointer"
              )}
              disabled={isLoading}
              aria-pressed={isSelected}
            >
              <span className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-on-surface">{personality.name}</span>
                    {isSelected && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold leading-none text-on-primary">
                        Active
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-on-surface-variant">
                    {personality.description}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
        <p className="label-md text-on-surface-variant">Tone preview</p>
        <p className="mt-2 text-sm italic leading-6 text-on-surface">"{selectedMeta.example}"</p>
      </div>
    </div>
  );
}

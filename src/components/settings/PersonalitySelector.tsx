import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { type PersonalityId } from "@/server/ai/personalities/constants";

type PersonalityMeta = {
  id: PersonalityId;
  name: string;
  icon: string;
  description: string;
  example: string;
};

const PERSONALITIES: PersonalityMeta[] = [
  {
    id: "default",
    name: "Default AI",
    icon: "🤖",
    description: "Normal, friendly, and professional tone",
    example: "Hello! I'd be happy to help you track your finances today.",
  },
  {
    id: "influencer",
    name: "Influencer",
    icon: "✨",
    description: "Gen-Z slang, trendy, emoji-heavy",
    example: "Hey bestie! Let's get your finances slaying today, no cap! 💅",
  },
  {
    id: "tsundere",
    name: "Tsundere",
    icon: "😤",
    description: "Reluctant but caring, classic tropes",
    example: "It's not like I wanted to help you or anything! B-baka!",
  },
  {
    id: "yandere",
    name: "Yandere",
    icon: "💕",
    description: "Overly possessive, intense devotion",
    example: "I'll always watch over your finances. You only need me, right?",
  },
  {
    id: "businessman",
    name: "Businessman",
    icon: "💼",
    description: "Sharp, data-driven, professional",
    example: "Good morning. Let's review your financial metrics and optimize your portfolio.",
  },
  {
    id: "caveman",
    name: "Caveman",
    icon: "🪨",
    description: "Basic English, simple words, short sentences",
    example: "Money go in. Money go out. Track good. You smart.",
  },
  {
    id: "gamer",
    name: "Gamer",
    icon: "🎮",
    description: "Gaming references, HP/XP metaphors",
    example: "Welcome back, player! Let's check your financial stats and level up your savings!",
  },
  {
    id: "detective",
    name: "Detective",
    icon: "🔍",
    description: "Analytical, probing, observant",
    example: "Interesting... The evidence suggests there's more to this spending pattern. Let me investigate.",
  },
  {
    id: "zenmaster",
    name: "Zen Master",
    icon: "🧘",
    description: "Calm, mindful, philosophical",
    example: "Money flows like water, in and out. Let us find balance together.",
  },
  {
    id: "pirate",
    name: "Pirate",
    icon: "🏴‍☠️",
    description: "Nautical language, fun, adventurous",
    example: "Ahoy! Let's chart a course for treasure and batten down them expenses!",
  },
];

type PersonalitySelectorProps = {
  currentPersonality: string;
  onSelect: (personality: string) => Promise<void>;
};

export function PersonalitySelector({ currentPersonality, onSelect }: PersonalitySelectorProps) {
  const [selected, setSelected] = useState<string>(currentPersonality);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (personality: string) => {
    if (personality === selected) return;
    setLoading(personality);
    try {
      await onSelect(personality);
      setSelected(personality);
      const meta = PERSONALITIES.find((p) => p.id === personality);
      toast.success("Personality Updated", {
        description: `Switched to ${meta?.name || personality}`,
      });
    } catch {
      toast.error("Update Failed", {
        description: "Could not change personality. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PERSONALITIES.map((p) => {
          const isSelected = selected === p.id;
          const isHovered = hoveredId === p.id;
          const isLoading = loading === p.id;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelect(p.id)}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`text-left transition-all duration-200 rounded-xl border-2 ${
                isSelected
                  ? "border-gold-500 bg-gold-50/10 dark:bg-gold-500/10 shadow-lg shadow-gold-500/20"
                  : "border-border hover:border-gold-300 dark:hover:border-gold-700"
              } ${isLoading ? "opacity-60 cursor-wait" : "cursor-pointer hover:scale-[1.02]"}`}
              disabled={isLoading}
            >
              <Card className="border-0 bg-transparent">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{p.icon}</span>
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    {isSelected && (
                      <Badge variant="default" className="ml-auto bg-gold-500 text-gold-950">
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                {(isHovered || isSelected) && (
                  <CardContent className="pt-0">
                    <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground italic">
                      "{p.example}"
                    </div>
                  </CardContent>
                )}
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}

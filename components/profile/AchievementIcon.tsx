import {
  Footprints,
  Map,
  Flame,
  BookOpen,
  Mic,
  Award,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  footprints: Footprints,
  map: Map,
  flame: Flame,
  "book-open": BookOpen,
  mic: Mic,
};

export function AchievementIcon({
  icon,
  ...props
}: { icon: string } & Omit<LucideProps, "name">) {
  const Icon = ICONS[icon] ?? Award;
  return <Icon {...props} />;
}

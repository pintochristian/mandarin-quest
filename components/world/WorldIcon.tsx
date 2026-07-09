import {
  HandHeart,
  Coffee,
  MapPin,
  Home,
  Utensils,
  Bus,
  Signpost,
  Users,
  Phone,
  ShoppingBag,
  GraduationCap,
  Plane,
  Bed,
  Briefcase,
  Presentation,
  Heart,
  MessageCircle,
  Sparkles,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  "hand-heart": HandHeart,
  coffee: Coffee,
  "map-pin": MapPin,
  home: Home,
  utensils: Utensils,
  bus: Bus,
  signpost: Signpost,
  users: Users,
  phone: Phone,
  "shopping-bag": ShoppingBag,
  "graduation-cap": GraduationCap,
  plane: Plane,
  bed: Bed,
  briefcase: Briefcase,
  presentation: Presentation,
  heart: Heart,
  "message-circle": MessageCircle,
};

export function WorldIcon({
  icon,
  ...props
}: { icon: string | null } & Omit<LucideProps, "name">) {
  const Icon = (icon ? ICONS[icon] : undefined) ?? Sparkles;
  return <Icon {...props} />;
}

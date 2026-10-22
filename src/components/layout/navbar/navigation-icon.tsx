import {
  Code2,
  GitPullRequest,
  Globe,
  Route,
  Terminal,
  Users,
} from "lucide-react";

import type { NavigationIconName } from "@/config/navigation";

const icons = {
  terminal: Terminal,
  path: Route,
  community: Users,
  contribute: GitPullRequest,
  platform: Globe,
  source: Code2,
};

export function NavigationIcon({
  name,
  className,
}: {
  name: NavigationIconName;
  className?: string;
}) {
  const Icon = icons[name];

  return <Icon aria-hidden="true" className={className} strokeWidth={1.6} />;
}

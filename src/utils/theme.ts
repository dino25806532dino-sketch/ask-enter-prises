export type ThemeColor = 'monochrome' | 'noir' | 'minimal' | 'carbon' | 'white' | string;

export interface ThemeConfig {
  id: string;
  name: string;
  badge: string;
  primary: string;
  primaryHover: string;
  gradient: string;
  gradientText: string;
  glowBg: string;
  border: string;
  borderLight: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentText: string;
  ring: string;
  shadow: string;
  previewColor: string;
}

export const THEMES: Record<string, ThemeConfig> = {
  monochrome: {
    id: 'monochrome',
    name: 'Pure Monochrome',
    badge: 'Black & White Edition',
    primary: 'bg-white text-black',
    primaryHover: 'hover:bg-slate-200',
    gradient: 'from-white via-slate-100 to-slate-200',
    gradientText: 'from-white via-slate-200 to-slate-400',
    glowBg: 'bg-white/15',
    border: 'border-white/30',
    borderLight: 'border-white/15',
    badgeBg: 'bg-white/10',
    badgeText: 'text-white',
    badgeBorder: 'border-white/30',
    accentText: 'text-white',
    ring: 'ring-white/40',
    shadow: 'shadow-white/10',
    previewColor: '#ffffff',
  },
  noir: {
    id: 'noir',
    name: 'Obsidian Noir',
    badge: 'Ultra Minimal',
    primary: 'bg-white text-black',
    primaryHover: 'hover:bg-slate-100',
    gradient: 'from-zinc-100 via-white to-zinc-300',
    gradientText: 'from-white via-zinc-200 to-zinc-400',
    glowBg: 'bg-white/10',
    border: 'border-zinc-700',
    borderLight: 'border-zinc-800',
    badgeBg: 'bg-zinc-900',
    badgeText: 'text-zinc-100',
    badgeBorder: 'border-zinc-700',
    accentText: 'text-white',
    ring: 'ring-white/30',
    shadow: 'shadow-black/50',
    previewColor: '#f4f4f5',
  },
  minimal: {
    id: 'minimal',
    name: 'High Contrast B&W',
    badge: 'Monochrome Pro',
    primary: 'bg-white text-black',
    primaryHover: 'hover:bg-neutral-200',
    gradient: 'from-white via-neutral-100 to-neutral-200',
    gradientText: 'from-white via-neutral-200 to-neutral-400',
    glowBg: 'bg-white/15',
    border: 'border-white/40',
    borderLight: 'border-white/20',
    badgeBg: 'bg-black',
    badgeText: 'text-white',
    badgeBorder: 'border-white/40',
    accentText: 'text-white',
    ring: 'ring-white/50',
    shadow: 'shadow-white/20',
    previewColor: '#ffffff',
  },
};

export const getTheme = (_color?: string): ThemeConfig => {
  if (_color && _color in THEMES) {
    return THEMES[_color];
  }
  return THEMES.monochrome;
};

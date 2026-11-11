// Iconos SVG inline para el shell del app (sin dependencias externas).
// Estilo stroke, hereda color con currentColor — igual que components/ui/SocialIcons.

type IconProps = {
  size?: number
  className?: string
}

function base(size: number, className?: string) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  }
}

export function HomeIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  )
}

export function ActivityIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 12h4l2.5 7 5-16L17 12h4" />
    </svg>
  )
}

export function ClubIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6" />
      <path d="M17.5 14.2A5.5 5.5 0 0 1 21 20" />
    </svg>
  )
}

export function TrophyIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4v1a3 3 0 0 0 3 3" />
      <path d="M17 5h3v1a3 3 0 0 1-3 3" />
      <path d="M10 13.5V17H9a2 2 0 0 0-2 2v1h10v-1a2 2 0 0 0-2-2h-1v-3.5" />
    </svg>
  )
}

export function UserIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

export function SettingsIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  )
}

export function FlameIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.5.7-2.4 1.5-3.2C10.5 8.8 11.5 7 12 3Z" />
      <path d="M12 21a5 5 0 0 0 5-5c0-1.2-.4-2.2-1-3" />
    </svg>
  )
}

export function ArrowUpIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  )
}

export function ArrowDownIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  )
}

export function LogoutIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M9 12h11M16 8l4 4-4 4" />
    </svg>
  )
}

export function TargetIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  )
}

export function MenuIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function PanelLeftIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  )
}

export function DeviceIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="7" y="6" width="10" height="12" rx="3" />
      <path d="M9 6 9.5 3h5L15 6M9 18l.5 3h5l.5-3" />
      <circle cx="12" cy="12" r="2.2" />
    </svg>
  )
}

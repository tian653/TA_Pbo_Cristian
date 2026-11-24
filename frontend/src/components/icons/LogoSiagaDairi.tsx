interface LogoProps {
  className?: string
  size?: number
}

export default function LogoSiagaDairi({ className = "w-8 h-8", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Background Shield Gradient */}
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Mountain Highlight Gradient */}
        <linearGradient id="mountainGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </linearGradient>

        {/* Back Mountain Gradient */}
        <linearGradient id="backMountainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.5" />
        </linearGradient>

        {/* Beacon Glow */}
        <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="60%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* Outer Glow / Soft Border */}
      <path
        d="M24 4L7 11V22.5C7 33.2 14.3 41.8 24 44.5C33.7 41.8 41 33.2 41 22.5V11L24 4Z"
        fill="url(#shieldGrad)"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
      />

      {/* Inner Shield Contour */}
      <path
        d="M24 6.2L9.2 12.3V22.5C9.2 31.9 15.6 39.5 24 42C32.4 39.5 38.8 31.9 38.8 22.5V12.3L24 6.2Z"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.2"
        fill="none"
      />

      {/* Background Mountain Peak */}
      <path
        d="M17 33L26 20L35 33H17Z"
        fill="url(#backMountainGrad)"
      />

      {/* Foreground Mountain Peak (Dairi Heights) */}
      <path
        d="M11 34L22 17L30 30L26 34H11Z"
        fill="url(#mountainGrad)"
      />

      {/* Mountain Snow Ridge Lines */}
      <path
        d="M22 17L18.5 24L21 26L18 30L19.5 34"
        stroke="#2563EB"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Water / Lake Wave Contour (Danau Toba / Dairi Rivers) */}
      <path
        d="M12 36C16 34.5 20 37.5 24 36C28 34.5 32 37.5 36 36"
        stroke="#93C5FD"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Warning / Alert Pulse Wave (Top Beacon) */}
      <circle cx="24" cy="11.5" r="2.8" fill="url(#beaconGlow)" />
      <path
        d="M19 11C19 8.2 21.2 6 24 6C26.8 6 29 8.2 29 11"
        stroke="#FEF08A"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="1 2.5"
      />
    </svg>
  )
}


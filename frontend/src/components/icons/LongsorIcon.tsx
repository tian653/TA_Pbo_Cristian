interface IconProps {
  className?: string
}

// Ikon gunung/tanah longsor (BUKAN gelombang)
export default function LongsorIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2l6 9h-5l3 9-9-7h5L14 2z" opacity="0.7" />
      <path d="M4 20h16v2H4v-2zm1-3l3-5 2 2 3-4 3 3 2-3 2 4v6H5v-3z" />
    </svg>
  )
}

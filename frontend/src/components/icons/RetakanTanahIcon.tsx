interface IconProps {
  className?: string
}

// Ikon retakan tanah
export default function RetakanTanahIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8l3-3m10 3l-3-3M4 12h16M8 8l-3 3m14-3l-3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20h14" strokeWidth={2.5} />
    </svg>
  )
}

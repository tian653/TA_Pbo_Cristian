interface IconProps {
  className?: string
}

// Ikon air/gelombang untuk banjir
export default function BanjirIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2c-1.1 0-2 .9-2 2v2c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v9h16v-9c0-1.1-.9-2-2-2v-3c0-1.1-.9-2-2-2V4c0-1.1-.9-2-2-2zm-6 20c-.6 0-1-.4-1-1 0-.3.1-.5.3-.7.4-.4 1-.4 1.4 0 .2.2.3.4.3.7 0 .6-.4 1-1 1zm3 0c-.6 0-1-.4-1-1 0-.3.1-.5.3-.7.4-.4 1-.4 1.4 0 .2.2.3.4.3.7 0 .6-.4 1-1 1zm3 0c-.6 0-1-.4-1-1 0-.3.1-.5.3-.7.4-.4 1-.4 1.4 0 .2.2.3.4.3.7 0 .6-.4 1-1 1zm3 0c-.6 0-1-.4-1-1 0-.3.1-.5.3-.7.4-.4 1-.4 1.4 0 .2.2.3.4.3.7 0 .6-.4 1-1 1zm3 0c-.6 0-1-.4-1-1 0-.3.1-.5.3-.7.4-.4 1-.4 1.4 0 .2.2.3.4.3.7 0 .6-.4 1-1 1z" />
    </svg>
  )
}

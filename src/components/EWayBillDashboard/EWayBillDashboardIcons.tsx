interface ChevronDownProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

interface ArrowUpDownProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}


export function ChevronDown({ className }: ChevronDownProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function ArrowUpDown({ className }: ArrowUpDownProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m17 8-5-5-5 5" />
      <path d="m17 16-5 5-5-5" />
    </svg>
  )
}


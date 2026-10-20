export interface IconProps {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

export default function CowIcon({ size = 20, className = '', strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Horns */}
      <path d="M6.5 6.5C4.5 3.5 2.5 4 2 4.5c.6 2 2 3.2 4 3.7" />
      <path d="M17.5 6.5c2-3 4-2.5 4.5-2-.6 2-2 3.2-4 3.7" />
      {/* Ears */}
      <path d="M4 10.5C2.5 9.5 1.2 11 2.2 12.3c1.3 1 2.8.5 3.8-.3" />
      <path d="M20 10.5c1.5-1 2.8.5 1.8 1.8-1.3 1-2.8.5-3.8-.3" />
      {/* Head outline */}
      <path d="M6 7.5C6 6 8 5 12 5s6 1 6 2.5v6.2c0 2-1 3.3-2.5 4.1l-1.5.7h-4l-1.5-.7C7 17 6 15.7 6 13.7v-6.2z" />
      {/* Snout */}
      <rect x="7" y="14" width="10" height="6" rx="3" />
      {/* Nostrils */}
      <circle cx="9.8" cy="17" r="0.9" fill="currentColor" />
      <circle cx="14.2" cy="17" r="0.9" fill="currentColor" />
      {/* Eyes */}
      <circle cx="8.8" cy="10.8" r="0.9" fill="currentColor" />
      <circle cx="15.2" cy="10.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

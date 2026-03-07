interface FlagProps {
  className?: string;
}

export function SpainFlag({ className = "h-4 w-5" }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 750 500"
      className={className}
      aria-label="Bandera de España"
    >
      <rect width="750" height="500" fill="#c60b1e" />
      <rect y="125" width="750" height="250" fill="#ffc400" />
    </svg>
  );
}

export function USAFlag({ className = "h-4 w-5" }: FlagProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 7410 3900"
      className={className}
      aria-label="Flag of the United States"
    >
      <rect width="7410" height="3900" fill="#b22234" />
      <path
        d="M0,450H7410m0,600H0m0,600H7410m0,600H0m0,600H7410m0,600H0"
        stroke="#fff"
        strokeWidth="300"
      />
      <rect width="2964" height="2100" fill="#3c3b6e" />
      <g fill="#fff">
        {/* Row 1 - 6 stars */}
        <circle cx="247" cy="175" r="80" />
        <circle cx="741" cy="175" r="80" />
        <circle cx="1235" cy="175" r="80" />
        <circle cx="1729" cy="175" r="80" />
        <circle cx="2223" cy="175" r="80" />
        <circle cx="2717" cy="175" r="80" />
        {/* Row 2 - 5 stars */}
        <circle cx="494" cy="525" r="80" />
        <circle cx="988" cy="525" r="80" />
        <circle cx="1482" cy="525" r="80" />
        <circle cx="1976" cy="525" r="80" />
        <circle cx="2470" cy="525" r="80" />
        {/* Row 3 - 6 stars */}
        <circle cx="247" cy="875" r="80" />
        <circle cx="741" cy="875" r="80" />
        <circle cx="1235" cy="875" r="80" />
        <circle cx="1729" cy="875" r="80" />
        <circle cx="2223" cy="875" r="80" />
        <circle cx="2717" cy="875" r="80" />
        {/* Row 4 - 5 stars */}
        <circle cx="494" cy="1225" r="80" />
        <circle cx="988" cy="1225" r="80" />
        <circle cx="1482" cy="1225" r="80" />
        <circle cx="1976" cy="1225" r="80" />
        <circle cx="2470" cy="1225" r="80" />
        {/* Row 5 - 6 stars */}
        <circle cx="247" cy="1575" r="80" />
        <circle cx="741" cy="1575" r="80" />
        <circle cx="1235" cy="1575" r="80" />
        <circle cx="1729" cy="1575" r="80" />
        <circle cx="2223" cy="1575" r="80" />
        <circle cx="2717" cy="1575" r="80" />
        {/* Row 6 - 5 stars */}
        <circle cx="494" cy="1925" r="80" />
        <circle cx="988" cy="1925" r="80" />
        <circle cx="1482" cy="1925" r="80" />
        <circle cx="1976" cy="1925" r="80" />
        <circle cx="2470" cy="1925" r="80" />
      </g>
    </svg>
  );
}

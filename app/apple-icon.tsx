import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BRAND = "#225f1c";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 40,
          border: `7px solid ${BRAND}`,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 72 72" fill="none">
          <g stroke={BRAND} strokeOpacity="0.10" strokeWidth="1">
            <path d="M24 4 V68" />
            <path d="M48 4 V68" />
            <path d="M4 26 H68" />
            <path d="M4 50 H68" />
          </g>
          <path
            d="M10 50 Q 22 44, 28 36 T 46 22 T 62 18"
            stroke={BRAND}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeOpacity="0.30"
          />
          <path
            d="M14 56 Q 26 50, 32 40 T 50 28"
            stroke={BRAND}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="46" cy="22" r="13" fill={BRAND} fillOpacity="0.08" />
          <circle cx="46" cy="22" r="8.5" fill={BRAND} fillOpacity="0.16" />
          <path
            d="M46 12 C 51.5 12, 56 16.5, 56 22 C 56 29, 46 36, 46 36 C 46 36, 36 29, 36 22 C 36 16.5, 40.5 12, 46 12 Z"
            fill={BRAND}
          />
          <circle cx="46" cy="22" r="3.2" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}

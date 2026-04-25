import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "#0a0a0a",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 130,
            height: 130,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 130,
              height: 130,
              borderRadius: 65,
              border: "5px solid #22c55e",
              opacity: 0.35,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 90,
              height: 90,
              borderRadius: 45,
              border: "5px solid #eab308",
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 50,
              height: 50,
              borderRadius: 25,
              background: "#ef4444",
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 18,
              height: 18,
              borderRadius: 9,
              background: "#ffffff",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}

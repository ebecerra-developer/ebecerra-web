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
          background: "#1e5f6e",
        }}
      >
        <div
          style={{
            width: "44%",
            height: "44%",
            borderRadius: "50%",
            background: "#f7f0e3",
          }}
        />
      </div>
    ),
    { ...size }
  );
}

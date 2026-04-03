import { NextResponse } from "next/server";

// Digital Asset Links para TWA (Trusted Web Activity)  
// O fingerprint SHA-256 será preenchido após gerar o keystore com Bubblewrap
export async function GET() {
  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "app.vercel.pdffull.twa",
        sha256_cert_fingerprints: [
          "06:19:80:32:DA:27:F1:7B:97:3D:1A:F5:86:42:0B:A8:E0:80:89:C4:85:0A:E7:0E:74:1F:BE:A8:98:85:38:8D",
        ],
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

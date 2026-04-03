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
          // TODO: Substituir pelo fingerprint real após gerar keystore
          "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00",
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

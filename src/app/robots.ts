import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { isPreviewDeployment } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment()) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/"],
      },
    ],
    host: SITE_CONFIG.url,
  };
}

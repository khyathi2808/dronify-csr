import type { NextConfig } from "next";
import path from "path";

// GitHub Pages project sites live under /<repo>; the workflow sets NEXT_PUBLIC_BASE_PATH.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // /use-cases/csr/ -> use-cases/csr/index.html, which GitHub Pages serves directly.
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lucide-react and recharts both ship as large barrel exports — without
  // this, importing a single icon or chart component can pull unrelated
  // code into the same module graph, slowing dev compiles and bloating
  // the production bundle. This rewrites those imports to per-module
  // paths automatically.
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;

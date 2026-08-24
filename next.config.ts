import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit loads its standard fonts (e.g. Helvetica.afm) from disk relative to its own
  // __dirname at runtime. Next.js bundles route handler deps by default, which rewrites
  // that path and breaks the lookup (ENOENT on Helvetica.afm) - keep it a native require.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Run PostCSS/Tailwind transforms in worker threads instead of child
    // processes. The default ('childProcesses') relies on a loopback TCP
    // connection that sandboxed/firewalled build environments block, causing
    // Turbopack to panic with "Failed to write app endpoint /page".
    turbopackPluginRuntimeStrategy: "workerThreads",
  },
};

export default nextConfig;

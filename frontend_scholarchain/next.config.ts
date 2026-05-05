import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@meshsdk/core",
    "@meshsdk/react",
    "@meshsdk/wallet",
    "@meshsdk/core-csl",
    "@meshsdk/core-cst",
    "@meshsdk/transaction",
    "@meshsdk/provider",
    "@meshsdk/common",
    "@sidan-lab/sidan-csl-rs-browser",
    "@sidan-lab/sidan-csl-rs-nodejs",
    "@cardano-sdk/crypto",
    "libsodium-wrappers",
    "libsodium-wrappers-sumo",
  ],
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "@sidan-lab/sidan-csl-rs-browser",
        "libsodium-wrappers-sumo",
        "libsodium-wrappers",
      ];
    }
    return config;
  },
};

export default nextConfig;
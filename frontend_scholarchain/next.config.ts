import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, ".."),
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

    // The ESM builds of both libsodium packages reference missing .mjs files.
    // Alias both to their working CJS builds.
    config.resolve.alias = {
      ...config.resolve.alias,
      "libsodium-wrappers-sumo": path.resolve(
        __dirname,
        "node_modules/libsodium-wrappers-sumo/dist/modules-sumo/libsodium-wrappers.js"
      ),
      "libsodium-wrappers": path.resolve(
        __dirname,
        "node_modules/libsodium-wrappers/dist/modules/libsodium-wrappers.js"
      ),
    };

    // Suppress the async/await WASM warning from sidan-lab (MeshJS internal)
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      (warning: { message: string }) =>
        warning.message?.includes("sidan_csl_rs_bg.wasm") ||
        warning.message?.includes("async/await"),
    ];

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
      ];
    }
    return config;
  },
};

export default nextConfig;
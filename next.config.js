import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });
    // Add this to resolve TensorFlow.js issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tensorflow/tfjs$': '@tensorflow/tfjs/dist/tf.js',
    };
    return config;
  },
  // Use serverRuntimeConfig for server-side configuration
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  // Use publicRuntimeConfig for client-side configuration
  publicRuntimeConfig: {
    // Add any public runtime configuration here
  },
  // Increase the serverless function timeout if needed
  experimental: {
    serverComponentsExternalPackages: ['@tensorflow/tfjs', '@tensorflow-models/universal-sentence-encoder'],
  },
};

export default nextConfig;
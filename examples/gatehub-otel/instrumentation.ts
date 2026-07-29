// Next.js calls this automatically on server startup (App Router,
// Next 15+, no extra config flag needed). Copy this file to the project
// root (or src/) of each Vercel app, next to next.config.ts.
//
// Required packages:
//   npm i @vercel/otel @opentelemetry/api
//
// Required env vars (set in Vercel project settings, per project):
//   OTEL_SERVICE_NAME              e.g. "gatehub"
//   OTEL_EXPORTER_OTLP_ENDPOINT    e.g. "https://otel.yourdomain.com"
//   OTEL_EXPORTER_OTLP_HEADERS     e.g. "Authorization=Basic <base64 user:pass>"
//
// @vercel/otel reads OTEL_EXPORTER_OTLP_* env vars automatically and
// exports traces + Next.js's built-in metrics (route handler duration,
// fetch calls, etc.) over OTLP/HTTP to the shared collector.

import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "unknown-service",
  });
}

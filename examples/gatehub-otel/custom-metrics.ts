// Example of a custom business metric, e.g. inside a server action or
// API route handler that creates a new user in Supabase.
//
//   import { signupsCounter } from "@/lib/otel/custom-metrics";
//   await db.user.create({ data });
//   signupsCounter.add(1);

import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter(process.env.OTEL_SERVICE_NAME ?? "unknown-service");

export const signupsCounter = meter.createCounter("signups_total", {
  description: "Number of new user signups",
});

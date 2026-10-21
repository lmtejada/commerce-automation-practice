import { config } from "#/config.js";
import { AutomationHarness } from "#/harness.js";
import { auditTools } from "#/tools.js";

console.log(`${config.APP_NAME} started (env: ${config.NODE_ENV}, log level: ${config.LOG_LEVEL})`);
console.log("=== Starting Flaconi Business Automation Harness ===\n");

// Instantiate harness with observability hooks
const harness = new AutomationHarness({
  maxSteps: 6,
  hooks: {
    onStart: (goal) => {
      console.log(`[HOOK: onStart] Executing Goal: "${goal}"`);
    },
    onToolCalled: (toolName, input) => {
      console.log(`[HOOK: onToolCalled] Invoked "${toolName}" with args:`, JSON.stringify(input));
    },
    onError: (err) => {
      console.error(`[HOOK: onError] Harness caught failure:`, err.message);
    },
    onFinish: (summary) => {
      console.log(`\n[HOOK: onFinish] Execution completed successfully.`);
      console.log(`\n--- Final Agent Summary ---\n${summary}`);
    },
  },
});

// Run the operational task
const result = await harness.runTask(
  "Audit our catalog pricing against competitors. If our price is more than 20% higher than competitor pricing, log a HIGH severity PRICING_DISCREPANCY anomaly.",
  auditTools,
);

if (!result.success) process.exitCode = 1;

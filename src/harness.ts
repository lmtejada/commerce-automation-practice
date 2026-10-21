import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, stepCountIs } from "ai";

import { config } from "#/config.js";

import type { ToolSet } from "ai";

const google = createGoogleGenerativeAI({ apiKey: config.GOOGLE_GENERATIVE_AI_API_KEY });

const SYSTEM_PROMPT = `You are an automated Business Operations Agent for flaconi.
Your role is to inspect data using available tools, identify operational issues, and log appropriate anomalies.
Be concise, systematic, and take direct action using tools.`;

export interface HarnessHooks {
  onStart?: (goal: string) => void;
  onToolCalled?: (toolName: string, input: unknown, output: unknown) => void;
  onError?: (error: Error) => void;
  onFinish?: (summary: string) => void;
}

export interface HarnessConfig {
  maxSteps?: number;
  hooks?: HarnessHooks;
}

export type HarnessResult =
  { success: true; output: string; stepsTaken: number } | { success: false; error: string };

export class AutomationHarness {
  private readonly maxSteps: number;
  private readonly hooks: HarnessHooks;

  constructor(harnessConfig: HarnessConfig = {}) {
    this.maxSteps = harnessConfig.maxSteps ?? 5;
    this.hooks = harnessConfig.hooks ?? {};
  }

  async runTask(goal: string, tools: ToolSet): Promise<HarnessResult> {
    this.hooks.onStart?.(goal);

    try {
      // ReAct loop managed by the AI SDK; the harness enforces the step limit.
      const response = await generateText({
        model: google("gemini-flash-latest"),
        system: SYSTEM_PROMPT,
        prompt: goal,
        tools,
        stopWhen: stepCountIs(this.maxSteps),
        onStepFinish: (step) => {
          for (const call of step.toolCalls) {
            const result = step.toolResults.find((r) => r.toolCallId === call.toolCallId);
            this.hooks.onToolCalled?.(call.toolName, call.input, result?.output);
          }
        },
      });

      this.hooks.onFinish?.(response.text);
      return { success: true, output: response.text, stepsTaken: response.steps.length };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.hooks.onError?.(error);
      return { success: false, error: error.message };
    }
  }
}

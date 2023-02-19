import { green, red } from "./deps.ts";

export type ResultOk = { name: string; ok: true; message?: undefined };
export type ResultKo = {
  name: string;
  ok: false;
  message: string;
};
export type Result = ResultOk | ResultKo;

export type RunResult = { check: ResultOk; run?: undefined } | {
  check: ResultKo;
  run: Result;
};

export type Action = {
  /** A function to set the environment up. As its return type `Promise<void>` suggests,
  it may include side effects such as software installation or filesystem write.
  You can throw exceptions to indicate that the action has failed.
   */
  run: () => Promise<void>;
  /** Checks whether the environment is set up correctly.
  It should not have any implicit outputs (e.g. Assignment to variables in outer scope, writing to filesystem or making HTTP POST requests).
  Renamed from `stat` in v0.2. */
  check: () => Promise<Result>;
};

export type Task = {
  check: () => Promise<Result[]>;
  run: () => Promise<RunResult[]>;
};

export const defineTask = (actions: Action[]) => {
  const executeCheck: Task["check"] = async () => {
    const result = [];

    for (const { check } of actions) {
      result.push(await check());
    }

    return result;
  };

  const executeRun: Task["run"] = async () => {
    const result: RunResult[] = [];
    for (const { check, run } of actions) {
      const checkResult = await check();

      if (checkResult.ok) {
        result.push({ check: checkResult });
        continue;
      }

      try {
        await run();
      } catch (e) {
        result.push({
          check: checkResult,
          run: { ok: false, name: checkResult.name, message: e?.message },
        });
        continue;
      }

      result.push({
        check: checkResult,
        run: { ok: true, name: checkResult.name },
      });
    }

    return result;
  };

  return { check: executeCheck, run: executeRun };
};

/** Stringifies an `ActionResult` in human-readable format. */
export const prettyResult = (result: Result, { color = true } = {}) => {
  const [msg, paint] = result.ok
    ? [`OK ${result.name}`, green]
    : [`KO ${result.name}: ${result.message}`, red];

  return color ? paint(msg) : msg;
};

export const prettyRunResult = (
  result: RunResult,
  opt: { color?: boolean } = {},
) => {
  const checkMsg = prettyResult(result.check, opt);
  const msg = result.check.ok
    ? checkMsg
    : `${prettyResult(result.run as Result, opt)}
  ${checkMsg}`;

  return msg;
};

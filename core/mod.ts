import { green, red } from "./deps.ts";

export type Stat =
  & { name: string }
  & ({ ok: true; message?: undefined } | { ok: false; message: string });

export type Action = {
  /** A function to set the environment up. As its return type `Promise<void>` suggests, it may include side effects such as software installation or filesystem write. */
  run: () => Promise<void>;
  /** Checks whether the environment is set up correctly. It should not have any implicit outputs. */
  stat: () => Promise<Stat>;
};

export type Task = { stat: () => Promise<void>; run: () => Promise<void> };

export const defineTask = (actions: Action[]) => {
  const printStat = async () => {
    for (const { stat } of actions) {
      const statResult = await stat();
      if (statResult.ok) {
        console.log(green(`OK ${statResult.name}`));
      } else {
        console.log(red(`KO ${statResult.name}: ${statResult.message}`));
      }
    }
  };

  const executeRun = async () => {
    for (const { stat, run } of actions) {
      const statResult = await stat();

      if (statResult.ok) continue;

      try {
        await run();
      } catch (e) {
        console.log(red(`KO ${statResult.name}: ${e?.message}`));
        continue;
      }
      console.log(green(`OK ${statResult.name}`));
    }
  };

  return { stat: printStat, run: executeRun };
};

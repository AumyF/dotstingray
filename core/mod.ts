type Stat =
  & { name: string }
  & ({ ok: true; message?: undefined } | { ok: false; message: string });

export type Descriptor = {
  /** A function to set the environment up. As its return type `Promise<void>` suggests, it may include side effects such as software installation or filesystem write. */
  run: () => Promise<void>;
  /** Checks whether the environment is set up correctly. It should not have any implicit outputs. */
  stat: () => Promise<Stat>;
};
export type Plugin = () => Promise<Descriptor[]> | Descriptor[];

export const use = (plugins: Plugin[]) => {
  const callPlugin = () =>
    Promise.all(plugins.map((plugin) => plugin())).then((c) => c.flat());

  const printStat = async () => {
    const commands = await callPlugin();
    const stats = await Promise.all(commands.map(({ stat }) => stat()));

    for (const stat of stats) {
      if (stat.ok) {
        console.log(`OK ${stat.name}`);
      } else {
        console.log(`KO ${stat.name}: ${stat.message}`);
      }
    }
  };

  const run = async () => {
    const commands = await callPlugin();
    for (const { stat, run } of commands) {
      const statResult = await stat();

      if (statResult.ok) return;

      try {
        await run();
      } catch (e) {
        console.log(`KO ${statResult.name}: ${e?.message}`);
        continue;
      }
      console.log(`OK ${statResult.name}`);
    }
  };

  return { stat: printStat, run };
};

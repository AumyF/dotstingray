# Dotstingray

Dotstingray is a dotfiles management library which runs on [Deno](https://deno.land).

## Usage

Define dotfiles declaratively using `use`:

```ts
import { use } from "dotstingray/core/mod.ts";
import { link } from "dotstingray/utils/mod.ts";

const home = Deno.env.get("HOME");

if (!home) throw new Error("$HOME is not set");

export const deploy = use([
  () => [
    link({
      source: "./starship/starship.toml",
      destination: `${home}/.config/starship.toml`,
    }),
  ],
]);
```

You can now use `deploy.run()` to create symlinks, or `deploy.stat()` to check whether symlinks are deployed successfully.

# Dotstingray

Dotstingray is a dotfiles management library which runs on [Deno](https://deno.land).

## Usage

Define dotfiles declaratively using `defineTask`:

```ts
// dotfiles.ts
import { defineTask } from "https://deno.land/x/dotstingray@v0.1.1/core/mod.ts";
import { link } from "https://deno.land/x/dotstingray@v0.1.1/utils/mod.ts";

const home = Deno.env.get("HOME");

if (!home) throw new Error("$HOME is not set");

const deploy = defineTask([
  link({
    source: "./starship/starship.toml",
    destination: `${home}/.config/starship.toml`,
  }),
  link({ source: "./git/config", destination: `${home}/.config/git/config` }),
  link({ source: "./git/ignore", destination: `${home}/.config/git/ignore` }),
  link({
    source: "./neovim/init.lua",
    destination: `${home}/.config/nvim/init.lua`,
  }),
  link({ source: "./zsh/rc.zsh", destination: `${home}/.zshrc` }),
  link({ source: "./zsh/env.zsh", destination: `${home}/.zshenv` }),
  link({
    source: "./direnv/rc.sh",
    destination: `${home}/.config/direnv/direnvrc`,
  }),
]);

if (Deno.args.includes("deploy")) {
  if (Deno.args.includes("run")) {
    await deploy.run();
  } else {
    await deploy.stat();
  }
} else {
  console.log(`unknown commands: ${Deno.args}`);
  Deno.exit(1);
}
```

You can use `deploy.run()` to create symlinks, or `deploy.stat()` to check whether symlinks are deployed successfully.

Alternatively, you may export `deploy` and use in other scripts.

```ts
// run-deploy.ts
import { deploy } from "./dotfiles.ts";

await deploy.run();
```


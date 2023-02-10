import { Descriptor } from "../core/mod.ts";

/** Given a `source` and a `destination`, returns `Command` which represents symbolic link from `source` to `destination`. */
export const link = (
  { source, destination }: { source: string; destination: string },
): Descriptor => ({
  run: async () => {
    await Deno.symlink(source, destination);
  },
  stat: async () => {
    let path: string;

    try {
      path = await Deno.readLink(destination);
    } catch (e) {
      return { name: destination, ok: false, message: e.message };
    }

    let sourcePath: string;
    try {
      sourcePath = await Deno.realPath(source);
    } catch (e) {
      return { name: destination, ok: false, message: e.message };
    }

    if (path === sourcePath) {
      return { name: destination, ok: true };
    } else {
      return {
        name: destination,
        ok: false,
        message: "symlink does not point the destination",
      };
    }
  },
});

/** Given a `content` and a `destination`, returns `Command` which represents writing `content` to `destination`.
 */
export const write = (
  { content, destination }: {
    content: Uint8Array | string;
    destination: string;
  },
): Descriptor => ({
  run: async () => {
    if (content instanceof Uint8Array) {
      await Deno.writeFile(destination, content);
    } else {
      await Deno.writeTextFile(destination, content);
    }
  },
  stat: async () => {
    if (await Deno.readFile(destination) === content) {
      return { name: destination, ok: true };
    } else return { name: destination, ok: false, message: "file differs" };
  },
});

/**
 * Registers the module resolution hooks for `node --test`.
 * Imported via `node --import ./test/register.mjs --test ...`.
 */
import { register } from "node:module";

register("./hooks.mjs", import.meta.url);

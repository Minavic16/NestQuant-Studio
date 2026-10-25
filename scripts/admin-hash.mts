/**
 * Generates the scrypt hash for `ADMIN_PASSWORD_HASH`.
 *
 *   npm run admin:hash -- "your-password-here"
 *
 * The password is read from the argument if given, otherwise prompted for. The
 * plaintext is never printed and never stored, only the hash is shown, so it
 * can be pasted into the deployment's environment.
 *
 * Run through `test/register.mjs` so it can import the same hashing module the
 * server uses, keeping one implementation of the hash format.
 */
import { createInterface } from "node:readline";
import { hashPassword } from "../lib/admin/password.ts";

const MINIMUM_LENGTH = 12;

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const readline = createInterface({ input: process.stdin, output: process.stdout, terminal: true });

    // Do not echo what is typed.
    if (readline.output.isTTY) {
      const swallow = () => readline.output.write("");
      process.stdin.on("data", swallow);
      readline.on("close", () => process.stdin.off("data", swallow));
    }

    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const fromArgument = process.argv[2];

if (fromArgument) {
  if (fromArgument.length < MINIMUM_LENGTH) {
    fail(`Password must be at least ${MINIMUM_LENGTH} characters.`);
  }
  console.log(hashPassword(fromArgument));
} else {
  const password = await promptHidden("New dashboard password: ");
  const confirmation = await promptHidden("Repeat password: ");

  if (password !== confirmation) fail("Passwords do not match.");
  if (password.length < MINIMUM_LENGTH) {
    fail(`Password must be at least ${MINIMUM_LENGTH} characters.`);
  }

  console.log("");
  console.log("Add this to your environment (the password itself is not stored):");
  console.log(hashPassword(password));
}

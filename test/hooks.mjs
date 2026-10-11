/**
 * Module resolution and load hooks for the test runner.
 *
 * Node runs TypeScript directly but requires a file extension and cannot parse
 * JSX, CSS modules, or Next's client components. This hook teaches Node about:
 *   • the `@/` path alias declared in tsconfig.json
 *   • extensionless relative imports used throughout the codebase
 *   • `.ts` / `.tsx` sources, transpiled with the project's own TypeScript
 *   • CSS modules, stubbed with a proxy that returns the class name
 *   • Next's client components (`next/link`, `next/image`) replaced by stand-ins
 * so tests can import application modules exactly as the application does.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

/** Next client components are replaced by inert stand-ins in tests. */
const STUBS = {
  "next/link": "test/stubs/next-link.ts",
  "next/image": "test/stubs/next-image.ts",
};

function candidates(base) {
  return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
}

export async function resolve(specifier, context, nextResolve) {
  const stub = STUBS[specifier];
  if (stub) {
    return { url: pathToFileURL(`${ROOT}${stub}`).href, shortCircuit: true };
  }

  let base;

  if (specifier.startsWith("@/")) {
    base = `${ROOT}${specifier.slice(2)}`;
  } else if (specifier.startsWith(".") && context.parentURL) {
    base = fileURLToPath(new URL(specifier, context.parentURL));
  }

  if (base) {
    for (const option of candidates(base)) {
      if (existsSync(option)) {
        // No explicit format: Node infers it from the file extension.
        return { url: pathToFileURL(option).href, shortCircuit: true };
      }
    }
  }

  return nextResolve(specifier, context);
}

const CSS_MODULE_STUB = `
export default new Proxy({}, { get: (_target, property) => (typeof property === "string" ? property : undefined) });
`;

export async function load(url, context, nextLoad) {
  if (url.endsWith(".css")) {
    return { format: "module", source: CSS_MODULE_STUB, shortCircuit: true };
  }

  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const path = fileURLToPath(url);
    const source = await readFile(path, "utf8");
    const { outputText } = ts.transpileModule(source, {
      fileName: path,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
        jsxImportSource: "react",
        useDefineForClassFields: true,
      },
    });

    return { format: "module", source: outputText, shortCircuit: true };
  }

  return nextLoad(url, context);
}

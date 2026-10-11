/**
 * Minimal DOM environment for component tests.
 *
 * Importing this module installs a jsdom window as the global document before
 * any testing library is loaded, so component tests can run under Node's
 * built-in test runner without a browser.
 */
import { JSDOM } from "jsdom";

if (!globalThis.document) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://desired-homes-interiors.test/",
    pretendToBeVisual: true,
  });

  const target = globalThis as unknown as Record<string, unknown>;
  const source = dom.window as unknown as Record<string, unknown>;

  const keys = [
    "window",
    "document",
    "location",
    "history",
    "navigator",
    "Element",
    "Node",
    "Text",
    "SVGElement",
    "HTMLElement",
    "HTMLInputElement",
    "HTMLButtonElement",
    "HTMLAnchorElement",
    "Event",
    "MouseEvent",
    "KeyboardEvent",
    "FocusEvent",
    "InputEvent",
    "PointerEvent",
    "CustomEvent",
    "MutationObserver",
    "DOMParser",
    "Image",
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "matchMedia",
  ];

  for (const key of keys) {
    if (key in source && !(key in target)) target[key] = source[key];
  }

  Object.defineProperty(target, "navigator", {
    value: source.navigator,
    configurable: true,
    writable: true,
  });

  // React's act() requires this flag in a non-browser environment.
  target.IS_REACT_ACT_ENVIRONMENT = true;
}

export {};

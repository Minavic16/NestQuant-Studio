/**
 * Shared helpers for component tests.
 *
 * Importing this module installs the jsdom globals first, so the testing
 * libraries then see a DOM. Components are created with `h` because Node runs
 * TypeScript without a JSX transform.
 */
import "./jsdom-env.ts";
import { createElement } from "react";

export const h = createElement;
export { render, screen, cleanup, act, within } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

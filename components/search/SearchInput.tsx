"use client";

import { useId } from "react";
import styles from "./search-input.module.css";

/** Labelled search field. The label is visually hidden but real. */
export function SearchInput({
  value,
  onValueChange,
  onSubmit,
  placeholder,
  autoFocus = false,
  label = "Search products",
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  autoFocus?: boolean;
  label?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <form
      className={[styles.form, className ?? ""].filter(Boolean).join(" ")}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <input
        id={id}
        type="search"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        enterKeyHint="search"
        autoComplete="off"
        onChange={(event) => onValueChange(event.target.value)}
      />
    </form>
  );
}

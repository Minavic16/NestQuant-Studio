import styles from "./quantity-stepper.module.css";
import { MAX_ITEM_QUANTITY } from "@/lib/validation/validation";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";

/** Quantity control for a single enquiry line. Real buttons, labelled group. */
export function QuantityStepper({
  value,
  onChange,
  groupLabel,
}: {
  value: number;
  onChange: (quantity: number) => void;
  groupLabel: string;
}) {
  return (
    <div className={styles.stepper} role="group" aria-label={groupLabel}>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <MinusIcon />
      </button>

      <span className={styles.value} aria-hidden="true">
        {value}
      </span>

      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_ITEM_QUANTITY}
        aria-label="Increase quantity"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

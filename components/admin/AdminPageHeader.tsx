import styles from "./admin-page-header.module.css";

/** Consistent page header for every dashboard section. */
export function AdminPageHeader({
  title,
  intro,
  actions,
}: {
  title: string;
  intro?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {intro ? <p className={styles.intro}>{intro}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}

import styles from "./getting-started.module.css";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { WhatsAppChatButton } from "@/components/contact/WhatsAppChatButton";

/**
 * A truthful “What to send us” guide. It describes how to start a conversation;
 * it does not promise quotations, visits, delivery or installation.
 */
export function GettingStarted() {
  return (
    <Section tone="paper" className={styles.section}>
      <div className={styles.layout}>
        <div className={styles.intro} data-reveal>
          <p className={styles.eyebrow}>What to send us</p>
          <h2 className={styles.heading}>A useful first message is simpler than you think.</h2>
          <p className={styles.body}>
            You do not need a complete brief to begin. A photo and a sentence about what is
            bothering you is enough for us to understand the room or the piece you are considering.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/contact" variant="primary">
              Start a conversation
            </ButtonLink>
            <WhatsAppChatButton className={styles.whatsapp} />
          </div>
        </div>

        <ul className={styles.list} data-reveal-group>
          <li className={styles.item} data-reveal>
            <span className={styles.stepLabel}>Photo</span>
            <div>
              <h3 className={styles.itemTitle}>A photo or description of the space or item</h3>
              <p className={styles.itemBody}>
                A phone photo is enough. Show the window, the wall, or the product you are
                comparing.
              </p>
            </div>
          </li>

          <li className={styles.item} data-reveal>
            <span className={styles.stepLabel}>Measurements</span>
            <div>
              <h3 className={styles.itemTitle}>Approximate measurements, if you have them</h3>
              <p className={styles.itemBody}>
                Width and drop for a window, or the item name for a product. Rough figures are
                fine, and they are a starting point, not a commitment.
              </p>
            </div>
          </li>

          <li className={styles.item} data-reveal>
            <span className={styles.stepLabel}>Direction</span>
            <div>
              <h3 className={styles.itemTitle}>The style or finish you have in mind</h3>
              <p className={styles.itemBody}>
                Link a project or product from this site, or describe the look in your own words.
              </p>
            </div>
          </li>
        </ul>
      </div>

      <p className={styles.note}>
        The conversation continues on WhatsApp or by email. You will review and send your own
        message. Nothing is submitted automatically from this site.
      </p>
    </Section>
  );
}

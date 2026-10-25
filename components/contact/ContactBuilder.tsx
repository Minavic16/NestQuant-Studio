"use client";

import { useId, useMemo, useRef, useState } from "react";
import styles from "./contact-builder.module.css";
import { buildWhatsAppUrl, type ContactDetails } from "@/lib/whatsapp/whatsapp";
import { trackEmailClick, trackWhatsAppClick } from "@/lib/analytics/analytics";

const INTERESTS = ["Curtains", "Accessories", "Window solutions", "Not sure yet"] as const;

type Interest = (typeof INTERESTS)[number];

export function ContactBuilder({
  contact,
  initialReference = "",
  initialMessage = "",
}: {
  contact: ContactDetails;
  initialReference?: string;
  initialMessage?: string;
}) {
  const id = useId();
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [name, setName] = useState("");
  const [interest, setInterest] = useState<Interest>("Curtains");
  const [message, setMessage] = useState(initialMessage);
  const [reference, setReference] = useState(initialReference);
  const [measurements, setMeasurements] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const composed = useMemo(() => {
    const lines = ["Hello Desired Homes Interiors,", ""];
    if (name.trim()) lines.push(`Name: ${name.trim()}`);
    lines.push(`Interested in: ${interest}`);
    lines.push("", "Message:", message.trim());

    if (reference.trim()) lines.push("", `Reference: ${reference.trim()}`);
    if (measurements.trim()) lines.push(`Approximate measurements: ${measurements.trim()}`);
    if (location.trim()) lines.push(`Location: ${location.trim()}`);
    lines.push("", "Thank you.");
    return lines.join("\n");
  }, [name, interest, message, reference, measurements, location]);

  const whatsappUrl = buildWhatsAppUrl(composed, contact);
  const subject = reference.trim() || "Room enquiry";
  const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(composed.replace(/\n/g, "\r\n"))}`;

  function validate(): boolean {
    if (message.trim().length === 0) {
      setError("Please add a short message so we know what you would like to discuss.");
      setStatus(null);
      messageRef.current?.focus();
      return false;
    }
    setError(null);
    return true;
  }

  function openWhatsApp() {
    if (!validate()) return;
    trackWhatsAppClick("contact");
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setStatus("WhatsApp opened in a new tab. Review and send your message there.");
  }

  function openEmail() {
    if (!validate()) return;
    trackEmailClick("contact");
    window.location.href = mailtoUrl;
    setStatus("Your email draft is opening. Review and send it from your email app.");
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(composed);
      setStatus("Message copied. You can paste it into WhatsApp or your email app.");
    } catch {
      messageRef.current?.focus();
      setStatus("Copying was not available in this browser. Select the message and copy it manually.");
    }
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        openWhatsApp();
      }}
    >
      <div className={styles.head}>
        <h2 className={styles.title}>Prepare a message</h2>
        <p className={styles.intro}>
          Fill in what you know. The message is prepared here and sent by you in WhatsApp or email
          — nothing is submitted from this page.
        </p>
      </div>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>
            Your name <span className={styles.optional}>(optional)</span>
          </span>
          <input
            className={styles.input}
            value={name}
            autoComplete="name"
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>What are you interested in?</span>
          <select
            className={styles.select}
            value={interest}
            onChange={(event) => setInterest(event.target.value as Interest)}
          >
            {INTERESTS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-message`}>
            Your message
          </label>
          <textarea
            id={`${id}-message`}
            ref={messageRef}
            className={styles.textarea}
            rows={5}
            value={message}
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : `${id}-message-hint`}
            onChange={(event) => {
              setMessage(event.target.value);
              if (error) setError(null);
            }}
          />
          <p id={`${id}-message-hint`} className={styles.hint}>
            A sentence about the room, the window or the piece is enough to begin.
          </p>
          {error ? (
            <p id={`${id}-error`} className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <label className={styles.field}>
          <span className={styles.label}>
            Project or product reference <span className={styles.optional}>(optional)</span>
          </span>
          <input
            className={styles.input}
            value={reference}
            maxLength={160}
            onChange={(event) => setReference(event.target.value)}
            placeholder="A project title, product name or URL"
          />
        </label>

        <div className={styles.split}>
          <label className={styles.field}>
            <span className={styles.label}>
              Approximate measurements <span className={styles.optional}>(optional)</span>
            </span>
            <input
              className={styles.input}
              value={measurements}
              maxLength={120}
              onChange={(event) => setMeasurements(event.target.value)}
              placeholder="e.g. 180 cm wide × 240 cm drop"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              Location <span className={styles.optional}>(optional)</span>
            </span>
            <input
              className={styles.input}
              value={location}
              autoComplete="address-level2"
              maxLength={80}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className={styles.handoff}>
        <button type="submit" className={styles.primary}>
          Continue on WhatsApp
        </button>
        <button type="button" className={styles.secondary} onClick={openEmail}>
          Open email draft
        </button>
        <button type="button" className={styles.copy} onClick={copyMessage}>
          Copy message
        </button>
      </div>

      <p className={styles.note}>
        You will review and send the message yourself. To share room photos, attach them in
        WhatsApp after the chat opens.
      </p>

      <p className={styles.status} role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}

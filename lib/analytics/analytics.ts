/**
 * Analytics abstraction (ARCHITECTURE.md §14).
 *
 * No vendor is installed. The call sites already use these functions, so adding
 * a provider later is a single implementation — no component changes, and the
 * UI never depends on a particular vendor.
 */

export type AnalyticsContext = "enquiry" | "product" | "contact";

export type AnalyticsEvent =
  | { name: "product_view"; slug: string }
  | { name: "enquiry_added"; slug: string }
  | { name: "enquiry_removed"; slug: string }
  | { name: "whatsapp_click"; context: AnalyticsContext }
  | { name: "email_click"; context: AnalyticsContext }
  | { name: "search"; query: string; results: number };

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
}

const noopProvider: AnalyticsProvider = {
  track: () => {
    /* intentionally silent until a provider is configured */
  },
};

let provider: AnalyticsProvider = noopProvider;

export function setAnalyticsProvider(next: AnalyticsProvider): void {
  provider = next;
}

/** Tracking must never break the interface. */
export function track(event: AnalyticsEvent): void {
  try {
    provider.track(event);
  } catch {
    /* ignore */
  }
}

export const trackProductView = (slug: string) => track({ name: "product_view", slug });
export const trackEnquiryAdded = (slug: string) => track({ name: "enquiry_added", slug });
export const trackEnquiryRemoved = (slug: string) => track({ name: "enquiry_removed", slug });
export const trackWhatsAppClick = (context: AnalyticsContext) =>
  track({ name: "whatsapp_click", context });
export const trackEmailClick = (context: AnalyticsContext) =>
  track({ name: "email_click", context });
export const trackSearch = (query: string, results: number) =>
  track({ name: "search", query, results });

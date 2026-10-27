# MOTION.md, Desired Homes Interiors

The motion system is deliberately small. It exists to confirm interaction and to ease content
into view, never to compete with the photography or delay a useful action.

There is no animation library. Every effect uses CSS transitions or keyframes, driven by the
tokens in `styles/tokens.css` and the shared rules in `styles/motion.css`. The only scripted
motion is one document-level `IntersectionObserver` in
`components/motion/ScrollReveal.tsx`, plus the existing dashboard metric counter.

---

## 1. Tokens

All durations, easings and distances live in `styles/tokens.css`:

| Token | Value | Used for |
| --- | --- | --- |
| `--duration-fast` | 160ms | colour, border and opacity feedback |
| `--duration-badge` | 160ms | enquiry count badge |
| `--duration-menu` | 200ms | dashboard metrics panel |
| `--duration-panel` | 220ms | search panel and mobile drawer |
| `--duration-page` | 460ms | page-entry heading block |
| `--duration-reveal` | 520ms | scroll reveal |
| `--duration-image` | 620ms | hero image reveal and product image crop |
| `--duration-press` | 90ms | press feedback |
| `--ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | state feedback |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | entrances |
| `--ease-panel` | `cubic-bezier(0.22, 1, 0.36, 1)` | panels |
| `--reveal-distance` | `0.75rem` | page and scroll entrances |
| `--stagger` | `70ms` | related reveal groups and hero sequence |
| `--panel-distance` | `0.5rem` | drawer and search panel |
| `--image-zoom` | `1.02` | product card hover/focus crop |
| `--press-distance` | `1px` | button press |

Components reference these tokens. A new local duration or easing is a design decision and
should be added here first.

---

## 2. Vocabulary

The conceptual names from the brief map to concrete CSS and markup:

| Concept | Implementation |
| --- | --- |
| `reveal` | `[data-reveal]` plus `data-reveal-state="hidden"` / `"visible"` |
| `staggerGroup` | `[data-reveal-group]` on the parent; direct `[data-reveal]` children receive up to three stagger steps |
| `pageTransition` | `[data-page-enter]` on the heading block; no route transition |
| `imageReveal` | `[data-page-enter="image"]` on the hero media frame |
| `interactivePress` | `[data-press]` on shared buttons and links; chips use the same tokens locally |
| `panelTransition` | `panel-fade`, `panel-slide-in` and `panel-rise-in` keyframes in `styles/motion.css` |
| `loadingState` | No skeleton or spinner is used for server-rendered catalogue content. Existing honest placeholders remain in `MediaSlot` for missing or failed images. |

---

## 3. Page entry

`[data-page-enter]` runs `page-rise`: a `--reveal-distance` translate over
`--duration-page`. `[data-page-enter="image"]` runs `image-reveal`: a 1.015 scale down to 1
inside the existing `overflow: hidden` frame. Both animate transform only, so the hero image
and heading are contentful from the first paint and the LCP is not delayed by a fade.

The home hero animates only the heading, the action row and the photograph. The eyebrow, lede
and tertiary work link are immediately visible. The heading begins at once and the actions
follow after one `--stagger` step, so the sequence finishes in roughly 530ms. Interior route
headers use the same page-entry attribute on the whole header block.

No animation is required for content to be readable. If the stylesheet animation does not run,
the elements are in their normal visible state.

---

## 4. Scroll reveal

Mark a block with `data-reveal`; mark a short row of related blocks with `data-reveal-group`
on the parent and `data-reveal` on each child.

`ScrollReveal` mounts once in the root layout and:

1. Does nothing when `prefers-reduced-motion: reduce` matches or
   `IntersectionObserver` is unavailable.
2. Reveals anything already inside the first viewport immediately. Above-the-fold content is
   never hidden and then animated.
3. Marks below-fold elements `data-reveal-state="hidden"` and observes them.
4. Sets `data-reveal-state="visible"`, then unobserves each element when it first intersects.
5. Uses one `MutationObserver` to register content added by client-side navigation, so a new
   route does not inherit a stale hidden state.
6. Disconnects both observers and removes the state attributes on unmount.

The CSS only hides an element when the observer has explicitly written
`data-reveal-state="hidden"`. With JavaScript disabled, the attribute is never written and all
content remains visible. There is no global `html` class that can hide unprocessed content.

Reveals are applied to section heads, the three category cards, the two supporting project
cards, the enquiry guide rows, the About pair and the closing band. The product grid is revealed
as one block, not as sixteen independent nodes.

---

## 5. Interaction feedback

- Shared `Button` and `ButtonLink` render `data-press`; `[data-press]:active` moves the control
  down by `--press-distance` for immediate feedback.
- Product cards keep the existing quiet opacity change and add a 1.02 image scale on hover and
  keyboard focus. The scale is inside the media frame, so it cannot crop a fixing out of frame
  or shift layout. It is gated behind `prefers-reduced-motion: no-preference`.
- Hover states have matching `:focus-visible` states for navigation underlines, product and
  category media, arrows, footer-style text links and panel close buttons. Keyboard focus also
  keeps the global 2px ring.
- Press feedback is immediate and is not removed by reduced motion; only the 1px transform is.

---

## 6. Panels

The mobile drawer and search panel use `panel-fade`, `panel-slide-in` and `panel-rise-in`.
They animate opacity and transform only. The drawer slides in from the right by
`--panel-distance`; the desktop search panel rises by the same distance; the mobile search
view fades. Existing dialog behaviour is unchanged: focus trap, Escape to close, scroll lock,
focus restoration and labelled dialogs all come from `useDialogBehaviour`.

Panels open promptly and close predictably. There is no exit animation because the dialog is
unmounted on close; adding one would require keeping an inert panel mounted and is not worth
the complexity.

Safe-area insets are included in the drawer and search padding, so controls are not placed
under a home indicator or notch.

---

## 7. Loading and route transitions

The catalogue, work, category and product routes are server-rendered. Their content is present
in the initial response, so there is no genuine pending state to skeleton. The shop's Suspense
fallback renders the complete product grid. `MediaSlot` keeps its reserved aspect ratio and
honest placeholder for missing or failed images.

No route transition is implemented. Static App Router navigation is already fast; delaying
content to animate a page exit would risk back/forward behaviour, direct links and error
states. Fast, predictable navigation wins.

The dashboard metric counter remains the one scripted number animation. It renders the final
value first and does nothing under reduced motion.

---

## 8. Reduced motion

`styles/base.css` collapses animation and transition durations and delays to `0.01ms` under
`prefers-reduced-motion: reduce`. `styles/motion.css` additionally:

- removes page-entry animations;
- forces reveal elements to opacity 1, no transform and no transition;
- removes the press translate;
- leaves colour, border and opacity state changes immediate and understandable.

The observer never writes a hidden state while reduced motion is active. If the preference
changes while the page is open, the observer stops and reveals everything; if it is turned off
again, the observer restarts with a fresh set of tracked elements.

No content, control or focus target depends on motion to become visible or usable.

---

## 9. Performance rules

- Animate `transform` and `opacity`; never width, height, top, left or large filters.
- No `will-change` is used globally or speculatively.
- One IntersectionObserver and one MutationObserver for the document, not one per component.
- The observer unobserves elements after their first reveal and disconnects on unmount.
- Hero entry is CSS-only and starts immediately; no JavaScript gate, no artificial delay.
- No animation dependency is installed. `package.json` is unchanged by the motion work.
- Scroll reveals are limited to a small number of large blocks, not every card or paragraph.

---

## 10. Adding motion later

1. Reuse a token. If a new duration or distance is genuinely needed, add it to
   `styles/tokens.css` and document it here.
2. Prefer a data attribute and the shared rules in `styles/motion.css` over a new component.
3. For a scroll reveal, add `data-reveal` to a block that is large enough to be worth the
   effect. Use `data-reveal-group` only for a short related row.
4. For interaction feedback, add a matching `:focus-visible` state. Hover alone is not enough.
5. Test with JavaScript disabled, with reduced motion, at 320px and with keyboard only.
6. Do not add a route transition, a global loader or a skeleton unless the application has a
   real pending state that the current server-rendered routes do not.

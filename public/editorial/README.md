# Drop interior / editorial photography here.

`public/editorial/` holds imagery that is not tied to a single product: the hero, the About page
lockup band and the category tiles once real photography exists.

Suggested layout:

```
public/editorial/hero.jpg        ← 2400px wide, landscape
public/editorial/about.jpg
public/editorial/curtains.jpg
public/editorial/accessories.jpg
public/editorial/window-solutions.jpg
```

Until files are added:

- the home hero shows the supplied brand lockup on black (DESIGN.md §8.3),
- the About band shows the same lockup,
- category tiles show an "Image to come" slot.

Replacing any of them is a content change in `data/` or a component constant — never a redesign.
Every image is served through `next/image` with explicit `sizes`, so keep source files at the
resolution they will be displayed at ×2 (e.g. 1600px wide for a 800px slot).

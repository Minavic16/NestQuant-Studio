import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { h, render, screen } from "@/test/component";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/types";

const product: Product = {
  id: "1",
  slug: "linen-sheer-curtain",
  name: "Linen Sheer Curtain",
  category: "curtains",
  type: "Rods",
  images: [],
  price: 45000,
  currency: "NGN",
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("ProductCard", () => {
  it("shows name, type, category and price", () => {
    render(h(ProductCard, { product }));

    const link = screen.getByRole("link");
    assert.equal(link.getAttribute("href"), "/shop/linen-sheer-curtain");
    assert.match(link.textContent ?? "", /Linen Sheer Curtain/);
    assert.match(link.textContent ?? "", /Rods · Curtains/);
    assert.match(link.textContent ?? "", /View details/);
    assert.ok(screen.getByText(/₦/));
  });

  it("shows the was price and the percentage saved", () => {
    render(
      h(ProductCard, {
        product: { ...product, price: 1000, compareAtPrice: 1500 },
      }),
    );

    assert.ok(screen.getByText("₦1,000"));
    assert.ok(screen.getByText("₦1,500"));
    assert.match(screen.getByText(/off$/).textContent ?? "", /33\.3% off/);
  });

  it("shows 'Price on request' when no price is supplied", () => {
    render(h(ProductCard, { product: { ...product, price: undefined } }));

    assert.ok(screen.getByText("Price on request"));
  });

  it("renders an image slot when no photography exists", () => {
    render(h(ProductCard, { product }));

    assert.ok(screen.getByTestId("media-slot"));
    assert.ok(screen.getByText("Photograph unavailable"));
  });

  it("renders the product image when one exists", () => {
    render(
      h(ProductCard, {
        product: {
          ...product,
          images: [
            { src: "/products/linen-sheer-curtain/01.jpg", alt: "Sheer linen curtain in a bright room" },
          ],
        },
      }),
    );

    const image = screen.getByAltText("Sheer linen curtain in a bright room");
    assert.match(image.getAttribute("src") ?? "", /\/products\/linen-sheer-curtain\/01\.jpg/);
  });
});

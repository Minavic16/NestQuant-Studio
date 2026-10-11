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
  images: [],
  price: 45000,
  currency: "NGN",
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("ProductCard", () => {
  it("links to the product and shows name, category and price", () => {
    render(h(ProductCard, { product }));

    const link = screen.getByRole("link");
    assert.equal(link.getAttribute("href"), "/shop/linen-sheer-curtain");
    assert.match(link.textContent ?? "", /Linen Sheer Curtain/);
    assert.match(link.textContent ?? "", /Curtains/);
    assert.match(link.textContent ?? "", /View details/);
    assert.ok(screen.getByText(/₦/));
  });

  it("shows 'Price on request' when no price is supplied", () => {
    render(h(ProductCard, { product: { ...product, price: undefined } }));

    assert.ok(screen.getByText("Price on request"));
  });

  it("renders an image slot when no photography exists", () => {
    render(h(ProductCard, { product }));

    assert.ok(screen.getByTestId("media-slot"));
    assert.ok(screen.getByText("Image to come"));
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

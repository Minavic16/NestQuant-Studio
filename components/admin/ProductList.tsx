"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./product-list.module.css";

/**
 * Read-only product list for the dashboard. Editing lives on the content page,
 * where a product's full record can be changed in one place.
 */

type Product = {
  slug: string;
  name: string;
  category: string;
  image?: string;
  price?: number;
  available?: boolean;
  featured?: boolean;
};

export function ProductList() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetch("/api/admin/content")
      .then((response) => response.json() as Promise<{ catalogue: { products: Product[] } }>)
      .then((data) => setProducts(data.catalogue.products))
      .catch(() => setProducts([]));
  }, []);

  if (products === null) return <p className={styles.state}>Loading products…</p>;

  const visible = products.filter((product) =>
    `${product.name} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className={styles.root}>
      <label className={styles.search}>
        <span className="visually-hidden">Search products</span>
        <input
          type="search"
          className={styles.input}
          placeholder="Search products…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {visible.length === 0 ? (
        <p className={styles.empty}>No products match that search.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Status</th>
              <th scope="col">
                <span className="visually-hidden">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((product) => (
              <tr key={product.slug}>
                <th scope="row" className={styles.name}>
                  <Link href={`/shop/${product.slug}`} className={styles.link}>
                    {product.name}
                  </Link>
                </th>
                <td>{product.category}</td>
                <td>
                  {typeof product.price === "number"
                    ? `₦${product.price.toLocaleString("en-NG")}`
                    : "Price on request"}
                </td>
                <td>
                  {product.available === false
                    ? "Unavailable"
                    : product.available === true
                      ? "Available"
                      : "Not stated"}
                  {product.featured ? " · featured" : ""}
                </td>
                <td>
                  <Link href="/admin/content" className={styles.edit}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

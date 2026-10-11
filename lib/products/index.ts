import { products as catalogue } from "@/data/products";
import { createLocalProductRepository, type ProductRepository } from "./repository";

/**
 * The catalogue instance used by the application. V1 reads the typed local
 * module; replacing the data source means changing this file only
 * (ARCHITECTURE.md §4).
 */
export const productRepository: ProductRepository = createLocalProductRepository(catalogue);

export { byName, createLocalProductRepository, type ProductRepository } from "./repository";

'use strict';

const pool = require('../db');

/**
 * Fetch all categories, products, and variants using a nested structure.
 */
async function getFullMenu() {
    const { rows } = await pool.query(`
        SELECT 
            c.id AS category_id,
            c.name AS category_name,
            c.description AS category_description,
            c.color,
            c.sort_order AS category_sort,
            p.id AS product_id,
            p.name AS product_name,
            p.description AS product_description,
            p.base_price,
            p.image_url,
            v.id AS variant_id,
            v.attribute,
            v.value,
            v.price_delta
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE AND p.is_available = TRUE
        LEFT JOIN product_variants v ON p.id = v.product_id AND v.is_available = TRUE
        WHERE c.is_active = TRUE
        ORDER BY c.sort_order ASC, p.id ASC, v.id ASC
    `);

    // Grouping by Category -> Product -> Variant
    const menu = [];
    const catMap = new Map();
    const prodMap = new Map();

    for (const row of rows) {
        if (!catMap.has(row.category_id)) {
            const newCat = {
                id: row.category_id,
                name: row.category_name,
                description: row.category_description,
                color: row.color,
                products: []
            };
            catMap.set(row.category_id, newCat);
            menu.push(newCat);
        }

        const category = catMap.get(row.category_id);

        if (row.product_id) {
            if (!prodMap.has(row.product_id)) {
                const newProd = {
                    id: row.product_id,
                    name: row.product_name,
                    description: row.product_description,
                    base_price: Number(row.base_price),
                    image_url: row.image_url,
                    variants: []
                };
                prodMap.set(row.product_id, newProd);
                category.products.push(newProd);
            }

            const product = prodMap.get(row.product_id);

            if (row.variant_id) {
                product.variants.push({
                    id: row.variant_id,
                    attribute: row.attribute,
                    value: row.value,
                    price_delta: Number(row.price_delta)
                });
            }
        }
    }

    return menu;
}

module.exports = {
    getFullMenu
};

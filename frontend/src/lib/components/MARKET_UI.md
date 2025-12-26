# Market UI Responsive Design System

This document explains the container query-based responsive design pattern used in the market components.

## Why Container Queries?

Traditional responsive design uses viewport units (`vw`) or media queries based on screen width. This breaks when components are placed in varying-width containers (sidebars, modals, split views).

**Container queries** let components respond to their *allocated space*, not the viewport. This makes `MarketOrders`, `MarketTrades`, etc. work correctly regardless of where they're placed in the layout.

## Core Concepts

### Container Query Inline Units (cqi)

```
1cqi = 1% of the container's inline (width) size
```

Set up a container with:
```css
.my-container {
  container-type: inline-size;
}
```

All children can then use `cqi` units, which respond to `.my-container`'s width.

### The Responsive Grid Pattern

We use CSS Grid with `clamp()` to create columns that:
- Have a **minimum** width (never smaller)
- Scale **proportionally** with container size using `cqi`
- Have a **maximum** width (never larger)

```css
grid-template-columns: clamp(min, proportional-cqi, max);
```

## Calculating cqi Values

### The Formula

```
column_cqi = (column_min_rem / total_min_rem) × 100
```

### Step-by-Step Example

Say you need a 4-column grid with minimums:
- Column A: 2rem
- Column B: 4rem
- Column C: 3rem
- Column D: 3rem
- **Total: 12rem**

Calculate each column's cqi:
- A: (2 / 12) × 100 = **16.667cqi**
- B: (4 / 12) × 100 = **33.333cqi**
- C: (3 / 12) × 100 = **25cqi**
- D: (3 / 12) × 100 = **25cqi**

The CSS:
```css
.my-container {
  container-type: inline-size;
}

.my-grid {
  display: grid;
  grid-template-columns:
    clamp(2rem, 16.667cqi, 3rem)
    clamp(4rem, 33.333cqi, 8rem)
    clamp(3rem, 25cqi, 5rem)
    clamp(3rem, 25cqi, 5rem);
}
```

**Result**: At minimum container width (12rem), each column is at its minimum. As container grows, columns scale proportionally until hitting their maximums.

## Current Component Reference

### marketOrders.svelte - Order Book

**Container**: `.order-book-side` (each half of the order book)

**Minimum total per side**: 9.5rem

| Column | Min | cqi | Max | Calculation |
|--------|-----|-----|-----|-------------|
| Button | 1.5rem | 15.789cqi | 2rem | 1.5/9.5 × 100 |
| Owner | 3rem | 31.579cqi | 6rem | 3/9.5 × 100 |
| Size | 2.5rem | 26.316cqi | 3.5rem | 2.5/9.5 × 100 |
| Price | 2.5rem | 26.316cqi | 3.5rem | 2.5/9.5 × 100 |

Bid side columns: Button → Owner → Size → Price (right-aligned)
Offer side columns: Price → Size → Owner → Button (left-aligned)

### marketTrades.svelte - Trade Log

**Container**: `.trades-container`

**Minimum total**: 11rem

| Column | Min | cqi | Max | Calculation |
|--------|-----|-----|-----|-------------|
| Buyer | 3rem | 27.273cqi | 6rem | 3/11 × 100 |
| Seller | 3rem | 27.273cqi | 6rem | 3/11 × 100 |
| Price | 2.5rem | 22.727cqi | 3.5rem | 2.5/11 × 100 |
| Size | 2.5rem | 22.727cqi | 3.5rem | 2.5/11 × 100 |

### market.svelte - Layout Breakpoint

**Container**: `.market-query-container`

**Breakpoint at 31rem**:
- Trade Log minimum: 11rem
- Order Book minimum: 19.5rem (9.5rem × 2 + 0.5rem gap)
- Total: 31rem

```css
@container (min-width: 31rem) {
  .tabbed-view { display: none; }
  .side-by-side { display: flex; }
}
```

Below 31rem: Tabbed mobile view (Trades/Orders tabs)
Above 31rem: Side-by-side desktop view

## Adding New Responsive Columns

1. **Define minimum widths** for each column (test at smallest reasonable container size)
2. **Sum the minimums** to get your total
3. **Calculate cqi** for each: `(min / total) × 100`
4. **Set maximums** (usually 1.5-2× the minimum works well)
5. **Wrap in container**: Add `container-type: inline-size` to parent
6. **Apply clamp**: `clamp(min-rem, calculated-cqi, max-rem)`

## Gotchas

- **Nested containers**: Each `container-type: inline-size` creates a new reference. `cqi` units refer to the nearest container ancestor.
- **Table rows**: Apply grid classes to `<tr>` elements via `class` attribute (see how `Table.Row` is used with `order-book-bid-cols`).
- **Scrollbar offset**: For scrollable areas with sticky headers, account for scrollbar width (see `.trades-header { margin-right: 6px }` workaround).

# Debugging Journal — Product Catalog

> **One sentence:** The breakpoint caught the crash before React swallowed the stack,
> React DevTools exposed the silent prop-name typo that the console never printed,
> and the Network tab showed the exact mistyped URL that `console.error` only
> described vaguely as "failed" — the console alone cannot tell you *which* URL was
> fetched, *which* prop was missing, or *on which line* the call stack unwound.

---

## Bug 1 — Crash: `.map()` on null state

### Planted in
`bugs/App.buggy.tsx` — `useState<Product[] | null>(null)` with an unchecked
`.filter()` / `.map()` call on the null value.

### Symptom

The app white-screens immediately on load. The browser console shows:

```
Uncaught TypeError: Cannot read properties of null (reading 'filter')
    at BuggyApp (App.buggy.tsx:97)
```

React's error overlay appears with the same message. Scrolling the page,
clicking the filter checkbox, or doing anything else is impossible — the
component never finishes rendering.

### Tool: Breakpoint (Sources panel)

1. Open **DevTools → Sources → App.buggy.tsx**.
2. Set a breakpoint on the line:
   ```ts
   const filteredProducts: Product[] = inStockOnly
     ? products!.filter(...)
     : products!;
   ```
3. Refresh the page. Execution pauses here.
4. Hover `products` in the editor — the tooltip shows **`null`**.
5. Check the **Scope** panel on the right: `products = null`.

The console error alone only gives you a type name and a line number.
The breakpoint lets you *see the value* at the moment of the crash —
`null` instead of `[]` — which immediately points to the `useState` initializer.

### What It Showed

`products` was `null` at the time `.filter()` was called because the initial
state was `useState<Product[] | null>(null)` instead of `useState<Product[]>(initialProducts)`.

### Fix

```diff
- const [products, setProducts] = useState<Product[] | null>(null);
+ const [products, setProducts] = useState<Product[]>(initialProducts);
```

Remove the `| null` union and initialize with real data (or `[]`).
TypeScript now rejects any code that passes `null` to `.map()` without a guard.

---

## Bug 2 — Silent wrong value: prop name typo

### Planted in
`bugs/App.buggy.tsx` — `<ProductCard proudct={product} />` (note the `u` and
`o` are swapped). TypeScript was bypassed with `@ts-expect-error`.

### Symptom

The product grid renders the correct *number* of cards but every card is
completely blank — no name, no price, no stock badge, no description.
No error appears in the console. The page looks like it "works" but shows
nothing useful. This is a **silent wrong value** — the hardest class of bug
to notice because there is no crash or warning.

### Tool: React DevTools — Components panel

1. Open **DevTools → React DevTools (⚛) → Components**.
2. Click any `ProductCard` in the component tree.
3. Read the **Props** panel on the right.

Expected:
```
product: { id: 1, name: "Laptop", price: 899, … }
```

Actual (buggy):
```
proudct: { id: 1, name: "Laptop", price: 899, … }
product: undefined
```

The prop named `proudct` (typo) is populated; the prop the component
actually reads (`product`) is `undefined`. Every `product?.name` evaluates
to `undefined`, so the card renders blank.

The console shows nothing because accessing a property on `undefined` with
optional chaining (`?.`) swallows `undefined` silently — no TypeError,
no warning, no log.

### What It Showed

React DevTools explicitly lists every prop by name. The misspelled key
`proudct` was visible instantly. Without DevTools you would have to search
the source manually or add console.log statements to every intermediate
render — a multi-minute hunt versus a five-second glance at the Props panel.

### Fix

```diff
  <ProductCard
    key={product.id}
-   proudct={product}
+   product={product}
  />
```

Remove the `@ts-expect-error` suppression so TypeScript enforces the correct
prop name at compile time — the typo becomes a red squiggle before the page
even loads.

---

## Bug 3 — Network failure: mistyped URL

### Planted in
`bugs/App.buggy.tsx` — `fetch("https://jsonplaceholder.typicode.com/apii/productz")`
(double-i in `apii`, trailing `z` in `productz`).

### Symptom

Clicking **"Test Network (Bug 3)"** appears to do nothing visible.
The console eventually prints:

```
Network request failed: Error: Request failed: 404
```

The message is vague. `console.error` only tells you the HTTP status code —
**not** the URL that was actually fetched. If the URL were assembled
dynamically from variables, the console message alone would be useless.

### Tool: Network tab

1. Open **DevTools → Network** *before* clicking the button.
2. Click **"Test Network (Bug 3)"**.
3. A new row appears in the Network log. Its columns show:

   | Name | Status | Type | Initiator |
   |------|--------|------|-----------|
   | `productz` | **404** | fetch | App.buggy.tsx:163 |

4. Click the row → **Headers** tab:
   - **Request URL**: `https://jsonplaceholder.typicode.com/apii/productz`
   - **Status Code**: 404 Not Found

5. Click **Preview** / **Response**: the server returns a 404 HTML page.

The misspelling is immediately obvious from the full URL in the Headers tab.
`console.error` only echoed the status number — it cannot reconstruct the
URL or show the response body.

### What It Showed

The Network tab showed the *exact* URL that was fetched, the HTTP verb,
the status code, and the response body all in one place. Finding the typo
took under ten seconds. Without the Network tab you would need to search the
source for every `fetch(` call and read each URL string manually.

### Fix

```diff
  const response: Response = await fetch(
-   "https://jsonplaceholder.typicode.com/apii/productz"
+   "https://jsonplaceholder.typicode.com/products"
  );
```

---

## Audit Checklist

| Item | Status |
|------|--------|
| `tsc -b --noEmit` exits 0 | ✅ |
| Zero `any` in `src/` | ✅ |
| `useState<Product[]>` explicit | ✅ |
| `React.ChangeEvent<HTMLInputElement>` on handlers | ✅ |
| `PublicProduct` via `Omit` | ✅ |
| `ProductFormDraft` via `Partial` | ✅ |
| `?.` + `??` on every optional access | ✅ |
| Explicit return type on every component | ✅ |
| Journal entry 1 names the tool | ✅ Breakpoint (Sources panel) |
| Journal entry 2 names the tool | ✅ React DevTools Components panel |
| Journal entry 3 names the tool | ✅ Network tab |

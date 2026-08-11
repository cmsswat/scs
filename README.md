# Swat Computer Shop — Management System

A complete offline (HTML + CSS + JavaScript) shop management system for a computer shop.
No server, no database installation — all data is saved in the browser using `localStorage`.

**DIT Final Project — Fakhr Un Nisa, Rabia, Mehreen**

## How to run
1. Extract the folder.
2. Open `index.html` in any browser (Chrome recommended).
3. Login with **admin / admin123** (can be changed in Settings).

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Login page |
| `dashboard.html` | Stat cards: products, sales, profit, stock value, low-stock alerts, recent sales |
| `purchase.html` | Record purchases; auto profit-per-unit + total cost; stock updates automatically |
| `products.html` | Product stock: search, filter, edit, delete, CSV export, low/out-of-stock tags |
| `sale.html` | New sale (POS): add items, discount, auto total & profit, save + invoice |
| `reports.html` | Date-range sales/purchase/profit report, best selling products, print & CSV |
| `settings.html` | Shop name/address/phone/currency, low-stock limit, login, reset demo data |
| `invoice/invoice.html` | Printable invoice (`invoice.html?id=INV-XXXX`) |

## Folders
- `css/` — styles (`style.css` is the shared theme, `print.css` for printing)
- `js/` — `storage.js` (data layer), `utils.js` (helpers), `app.js` (layout + auth guard), one file per page
- `images/` — logo, banner, avatar and icons
- `database/` — sample JSON data (reference copy of what the app stores in localStorage)

## Formulas used
- Profit per unit = Sale price − Purchase cost
- Bill total = Σ(qty × price) − discount
- Bill profit = Σ(qty × (price − cost)) − discount
- Stock value = Σ(qty × purchase cost)
- Low stock = quantity ≤ low-stock limit (default 5)

## Notes
- Data lives in the browser, so each computer/browser keeps its own records.
- Use **Settings → Reset all data** to reload the sample data for a demo.

# My OT Tracker — English Edition

A mobile-first PWA for personal overtime tracking. All main interface labels, notifications, reports, and 36 motivational messages are in English.

## Deploy to GitHub Pages

1. Extract the ZIP file.
2. Upload **all files in the ZIP** to the root of your existing `My-OT-Tracker` repository (replace files with the same names).
3. Keep `index.html`, `app.mjs`, `core.mjs`, `style.css`, `sw.js`, and `manifest.webmanifest` in the same folder.
4. Refresh the GitHub Pages website. If an old version appears, close/reopen the tab or clear the site's cache (do not delete site storage without exporting a backup).
5. On Android Chrome, choose Add to Home Screen / Install app.

## Behavior unchanged
- Fixed overtime hourly rate IDR 33,121 and salary reference IDR 5,730,100; independent settings.
- Alternating weekly shifts start Monday, November 16, 2026, morning first, with no monthly or annual reset.
- Every Sunday and Saturdays in afternoon-shift weeks are mandatory rest days; working these dates uses rest-day multiplier even if an official roster indicates work.
- Exact break overlap rules, multiple intervals, midnight crossing, roster overrides, and local IndexedDB storage are preserved.
- IndexedDB saved records are preserved when updating files on the same URL. Back up before updating as a precaution.

## Notes
- CSV supports offline import. XLS/XLSX requires the external Excel parser to load at least once online.
- The browser's native date/time pickers may use the device's regional formatting.
- Currency remains IDR. This edition uses English number formatting.
- Current report PDFs use the browser's Print / Save as PDF.


## Mobile fit update (v9)
- Larger touch targets, readable 16px inputs, and full-width layout on Android phones.
- Respects safe-area insets and prevents horizontal overflow.
- All business rules and calculations are unchanged.
- The old installed PWA may need to be closed/reopened or its page refreshed after GitHub Pages deploys.
- Make a JSON backup in Settings before any update. Do not uninstall or clear site data to refresh, since that can delete records.

## v10 update
- Automatic rotation of all 36 quotes; no manual arrows.
- Before Shift / After Shift / Both / Rest Day / Custom selection.
- Start/end time only; dates inferred for overnight overtime.
- For afternoon shift, After Shift defaults to 01:00–03:00 on the next day.
- Two overtime sessions share a single work-date calculation (first-hour premium applied once).
- Guard: normal scheduled shift intervals cannot be included in weekday overtime.
- Historical records and snapshots remain stored. Export JSON backup before updating.

- One saved overtime entry per work date: edit it to add both sessions, so the first-hour multiplier is not accidentally applied twice.


## v11 Performance optimization
- Render only the active screen; don't rebuild full calendar, reports, and chart together.
- Prefer cached static files to avoid slow loading on Android and support offline.
- Navigation falls back to the local offline page after a short network timeout.
- 36 motivational quotes still rotate every 5.5 seconds when Home is visible.
- No changes to salaries, overtime multipliers, shift rules, or saved database schema.
- Before deploying: Settings → Download JSON backup. Do not clear app/site data.


## v12 — Mobile full-width + faster startup
- Mobile content fills the available viewport, including installed PWA mode. Inputs are larger and cards take less vertical space on smaller phones.
- Startup uses cached app shell instantly when available, instead of waiting up to 1.8 s for the network.
- Reinstalling or clearing browser data is NOT needed. Back up records first, then upload all v12 files to the same GitHub Pages repository.
- On Android Chrome, disable **Desktop site** for the app URL if enabled. The layout responds to actual viewport size.
- All payroll calculations, shift rules, and stored database remain unchanged.


## v13 Payroll / mobile readability
- Payroll cutoff is the 16th through 15th, keyed by the month in which it ends. Dashboard and report now use this cutoff, rather than calendar months. Existing overtime records remain unchanged.
- Salary reference defaults to Rp5,730,100; employee JHT 2% and JPN 1%, both assumed calculated from salary (not overtime).
- Tax status TK/0, TER Category A according to PP 58/2023; PPh 21 applied to taxable gross (salary + overtime + optionally other taxable income) **before** JHT/JPN employee contributions. Full A rate schedule through 34% is included.
- Any employer-paid taxable benefit, non-salary payroll item or altered contribution base must be handled by comparing to actual payslip; TER is an estimate.
- December/last tax period must be reconciled annually under PMK 168/2023. Manual PPh 21 override is provided for payslip alignment, stored for the dashboard-selected payroll period only.
- Payroll cutoff date is separate from actual tax period/payment; the exact payroll-to-tax mapping depends on employer payout dates.
- Larger mobile typography throughout main, history and inputs.
- Back up local IndexedDB data before updating; do not uninstall or clear app data.
- Legal basis: https://jdih.kemenkeu.go.id/api/download/e47c3fc4-a912-4bf1-bcad-335fee3f71f8/2023pp058.pdf and https://jdih.kemenkeu.go.id/api/download/e60a82e0-b218-40f5-9d18-b924aa1e11ce/2023pmkeuangan168.pdf


## v14 Portrait readability
- Enlarged phone typography across overtime form, dashboard, payroll table, history, and bottom navigation.
- Bigger tap targets; keeps 2-column form on normal phones and switches to one column on narrow devices.
- Auto-changing motivation remains; redundant arrow hidden on phone.
- No changes to overtime, payroll, or local data format.
- Existing app data is local: export JSON backup before updating; do not uninstall or clear site data.
- Service worker cache version bumped to load new CSS on update.

## v15 Android portrait readability
- Extends large-text rules to Android PWA viewports up to 1100 CSS pixels (coarse pointer, portrait) and screen widths <=900.
- Larger earnings, payroll breakdown, chart, form, and bottom-navigation text.
- No data model, calculations or settings changed.
- Back up JSON before replacing GitHub files; do not uninstall PWA or clear storage.

## v16 – diagnosing unchanged mobile typography
- The header now shows `v16` next to My OT Tracker. If missing, the phone is using an older cached HTML document.
- `style-v16.css` has a new filename to bypass previously cached stylesheet.
- Service worker uses network-first navigation (2.2 second timeout) with offline fallback.
- On the installed app: close it fully and reopen after deploy. If v16 still does not show, open GitHub Pages in Chrome and refresh once; do not clear site storage or uninstall.
- Existing IndexedDB records and overtime calculations are unchanged. Export your JSON backup before upgrading.


## v17 — Comfort + security
- Theme: Light, Dark, System (Settings → Appearance). Stored independently of payroll data.
- Large portrait typography and higher contrast.
- Weekend audit: shows records inconsistent with Sunday and afternoon-rotation Saturday rules, without changing records.
- Optional Firebase Google cloud snapshot backup when configured. **Not enabled by default.** See `SETUP_FIREBASE.md`.
- First cloud connection checks for an existing remote backup; no automatic overwrite or restore. This is NOT multi-device live sync.
- Always export JSON before update. No IndexedDB schema migration required; original DB name and `state` key are preserved.


## v18 — Dark Modern Blue Polish
- Fixed dark-mode blank white area by covering the full document/root, body and viewport with the dark page background.
- Harmonized dark background/card/nav/shift/selected date colors using a cohesive blue palette.
- Improved text color and input contrast; cyan overtime indicators and selected-date highlight.
- Removed redundant motivation navigation button on mobile; quotes continue to rotate automatically.
- No edits to payroll, weekend classification logic, offline data format or cloud backup configuration.
- To update: back up data via Settings > Download JSON backup, upload ALL files including `style-v18.css`, then check that the header says v18.
- Firebase still requires manual project setup before automatic cloud backup works.


## v19 — Separate Before & After calculations
- New entries with multiple sessions calculate each session's first hour independently.
- For 7 hours Before Shift and 2 hours After Shift at Rp33,121/h on a workday: Rp447,133.50 + Rp115,923.50 = Rp563,057.00.
- Automatic breaks are deducted only when their time windows overlap an overtime session.
- Additional manual break minutes are assigned to the earliest session with payable time, then the following sessions.
- Old records without `calculationMode` continue using the original combined method; editing and saving a multi-session old record switches it to separate mode, with a confirmation if its payment changes.
- Back up your data in Settings before replacing the app files. No IndexedDB schema migration is required.
- Applies user-requested payroll/session policy; confirm its use with your employer's rules before relying on it as an entitlement calculation.

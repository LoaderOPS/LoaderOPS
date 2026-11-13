# Optional private Google cloud backup (v17)

The app remains fully offline and local-first until YOU configure Firebase and connect Google in Settings.

1. Create a Firebase project in https://console.firebase.google.com/ . Enable **Authentication → Sign-in method → Google**.
2. Under Authentication → Settings → Authorized domains, add `loaderops.github.io` (or your actual GitHub Pages host).
3. Create Cloud Firestore in production mode. Copy the rules from `firestore.rules` into Firestore → Rules and **Publish** them. Never use wide-open read/write rules.
4. From Project settings → Your apps → Web app, copy the PUBLIC web config values (`apiKey`, `authDomain`, `projectId`, `appId`, etc.). Put them in `firebase-config.mjs` as `export const firebaseConfig = { ... };` and commit that file. Do not publish service account keys or admin secrets.
5. Deploy your app files to GitHub Pages. In **Settings → Automatic cloud backup**, tap **Connect Google for Backup**. Use Chrome if an installed PWA blocks a sign-in popup.
6. Download JSON backup before first cloud connection. Inspect and decide whether to keep local data or restore cloud data. New connections never silently restore or overwrite an existing backup.
7. After choosing the right local records, tap **Back up now**. Enable automatic backup only if you understand it will replace prior cloud snapshots after local saves. This is snapshot backup, **not** two-way synchronization across devices. On another device, use Preview cloud restore before editing.

Security: Firestore rules restrict `/otBackups/{uid}` reads/writes to signed-in user with matching UID. For an actual deployment, verify these rules in Firebase console, as the source file alone does not activate them. Firebase Authentication and Firestore require internet. Local data remains on device even if cloud backup cannot connect. Firestore individual document size is limited; this snapshot implementation has an 800KB safety cap, and for larger datasets use manual JSON export.

Limitations: PWA sign-in popups may be blocked on some browsers. No persistent app login is required for normal offline use. Cloud backup is only activated after user signs in explicitly; authorization state is not restored for background backups after every restart, and user must reconnect. This is safer than implying unattended backups exist before OAuth session restoration is implemented.

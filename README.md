# WebStream — Starter

Quickstart (local dev)

1. Backend

```bash
cd backend
npm install
npm run dev
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

How to add a plugin:

1. Create `backend/src/plugins/yourplugin.js` exporting `{ id, name, search, load, loadLinks }`.
2. Restart backend (or implement hot-reload loader).
3. From the frontend, search and watch. Each search result includes `_plugin` to indicate which plugin provided it.

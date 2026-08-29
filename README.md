# DataVault — Colina Del Este

PWA comunitaria de proveedores de servicios para los residentes del Edificio Colina Del Este. Persistencia 100% en Firebase Firestore (SDK modular). Sin backend propio.

## Stack
- React 18 + Vite
- Firebase Firestore v10
- CSS puro (custom properties)
- vite-plugin-pwa (instalable, offline-first)

## Estructura
```
datavault-colina/
├── public/
├── src/
│   ├── components/    (10 componentes)
│   ├── services/      (firebase.js, firestoreService.js)
│   ├── utils/         (deviceId.js)
│   ├── styles/        (globals.css)
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .firebaserc
├── firebase.json
├── firestore.rules
├── vite.config.js
└── package.json
```

## Scripts
- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run preview` — preview local

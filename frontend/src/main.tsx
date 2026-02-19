import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { TourProvider } from './context/TourContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TourProvider> {/* ครอบเพื่อให้ทุกหน้าใช้ Data ชุดเดียวกัน */}
      <App />
    </TourProvider>
  </React.StrictMode>,
);
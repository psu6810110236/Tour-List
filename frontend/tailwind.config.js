/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- บรรทัดนี้สำคัญมาก บอกให้ Tailwind รู้ว่าไฟล์โค้ดเราอยู่ที่ไหน
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
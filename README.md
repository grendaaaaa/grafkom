<div align="center">
  <h1>Kalkulator & Visualisasi Algoritma Kurva</h1>
  <p><i>Aplikasi web interaktif untuk analisis performa pembentukan kurva parametrik dalam grafika komputer.</i></p>

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
</div>

<br />

Aplikasi ini tidak sekadar menggambar kurva, tetapi membedah proses komputasi yang terjadi di balik layar. Mulai dari perhitungan fungsi trigonometri hingga pembentukan koordinat _pixel-by-pixel_. Sangat cocok untuk eksplorasi optimasi dan performa *rendering*.

## Fitur Utama

- **Visualisasi Komprehensif:** Mendukung pembentukan 4 tipe konik utama: `Lingkaran`, `Elips`, `Parabola`, dan `Hiperbola`.
- **Render Berbasis Real-time:** Memanfaatkan keandalan Canvas HTML5 untuk rendering responsif berkecepatan tinggi.
- **Transparansi Kalkulasi:** Menampilkan log kalkulasi iteratif (nilai $x$ dan $y$ persis seperti yang dihitung oleh memori).
- **Resolusi Masalah Floating-Point:** Mengimplementasikan pendekatan _integer-based logic_ demi memastikan penutupan kurva (*curve closing*) sempurna tanpa *drift* presisi desimal JavaScript.
- **Sistem Pengujian Toleransi Performa:** Dilengkapi dengan modul *testing* skrip lokal berbasis Node.js yang mengukur persentase keseimbangan kualitas visual vs batas ambang operasi.

---

## Analisis Performa (*Performance Trade-Off*)

Menurunkan parameter resolusi (*delta*) memang membuat kurva tampak sempurna. Namun, di balik itu, beban kerja CPU melesat karena operasi trigonometri dan aljabar. 

Skrip penguji (`src/tests/tradeoff.ts`) menggunakan metode pendekatan batas maksimal *budget* operasi (*Target-based Threshold*). Kami memberikan limit **300 operasi aritmatika per kurva** lalu mencari nilai resolusi terhalus (*delta optimal*) yang mungkin dicapai.

### Temuan *Delta* Berdasarkan Batas Beban (Maks: 300 op)

| Spesifikasi Kurva | Delta Optimal | Kuantitas Iterasi | Beban Operasi (op) | Rata-rata Beban Eksekusi (ms per 10k loop) |
| :--- | :--- | :--- | :--- | :--- |
| **Lingkaran** | `0.045` | 141 titik | 282 | ~80 ms |
| **Elips** | `0.045` | 141 titik | 282 | ~76 ms |
| **Parabola** | `0.205` | 99 titik | 297 | ~29 ms |
| **Hiperbola** | `0.060` | 99 titik | 297 | ~79 ms |

> **Catatan Analisis Kompleksitas:** Lingkaran dan Elips menggunakan 2 op/titik (`cos`, `sin`). Parabola memakan 3 op/titik berbasis fungsi kuadrat. Sementara Hiperbola memakai 3 op/titik khusus (`cos`, `secant` via pembagian, `tan`).

---

## Panduan Instalasi Lokal

Persyaratan Utama: Pastikan Node.js v18+ terinstal di sistem Anda.

```bash
# 1. Klon repositori ke mesin lokal Anda
git clone <url-repositori-anda>

# 2. Unduh semua modul dependensi
npm install

# 3. Jalankan server lokal dalam mode pengembangan
npm run dev
```

Buka aplikasi melalui tautan `http://localhost:5173`.

<details>
<summary><b>Klik untuk melihat Struktur Direktori (Folder Structure)</b></summary>
<br />

```text
grafkom/
├── src/
│   ├── algorithms/       # Logika matematika murni terisolasi
│   │   ├── circle.ts     
│   │   ├── ellipse.ts    
│   │   ├── hyperbola.ts  
│   │   └── parabola.ts   
│   ├── components/       # Interface berbasis komponen React
│   │   ├── AlgorithmPhases.tsx     
│   │   ├── CalculationTable.tsx    
│   │   ├── ControlPanel.tsx        
│   │   └── VisualizationCanvas.tsx 
│   ├── tests/
│   │   └── tradeoff.ts   # Script evaluasi limit komputasi 
│   ├── App.tsx           
│   └── main.tsx          
├── package.json          
├── vite.config.ts        
└── tsconfig.json         
```
</details>

## Panduan Pengujian Terminal (*Benchmark*)

Modul pengujian yang digunakan untuk mengambil data pada tabel analisis di atas dapat Anda jalankan ulang atau kustomisasi nilai *budget*-nya sendiri.

Jalankan perintah ini:
```bash
npx tsx src/tests/tradeoff.ts
```
Papan hasil rekapitulasi waktu kalkulasi performa (*millisecond*) akan tercetak di layar terminal Anda seketika.

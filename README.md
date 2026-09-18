# Expense & Budget Visualizer

Aplikasi web untuk melacak pengeluaran dan anggaran bulanan dengan visualisasi data interaktif.

## Deskripsi

Expense & Budget Visualizer adalah aplikasi web client-side yang memungkinkan pengguna untuk:
- Mencatat transaksi pemasukan dan pengeluaran
- Mengkategorikan transaksi (Makanan, Transport, Hiburan, Utilitas, Lainnya)
- Menetapkan anggaran bulanan
- Melihat ringkasan keuangan bulanan
- Memvisualisasikan distribusi pengeluaran dengan pie chart
- Beralih antara tema terang dan gelap

## Fitur Utama

### 1. Manajemen Transaksi
- Tambah transaksi baru dengan jumlah, kategori, deskripsi, dan tanggal
- Hapus transaksi yang sudah ada
- Lihat riwayat transaksi (diurutkan dari terbaru)
- Validasi input otomatis

### 2. Anggaran Bulanan
- Tetapkan anggaran bulanan
- Pantau sisa anggaran secara real-time
- Peringatan otomatis jika anggaran terlampaui

### 3. Ringkasan Keuangan
- Total pemasukan bulan ini
- Total pengeluaran bulan ini
- Sisa anggaran
- Indikator visual untuk status anggaran

### 4. Visualisasi Data
- Pie chart interaktif untuk distribusi pengeluaran per kategori
- Warna unik untuk setiap kategori
- Persentase otomatis untuk setiap kategori

### 5. Tema Gelap/Terang
- Toggle antara tema terang dan gelap
- Preferensi tema disimpan secara otomatis
- Desain yang nyaman untuk mata

## Teknologi

Aplikasi ini dibangun dengan:
- **HTML5** - Struktur halaman
- **CSS3** - Styling dengan CSS Variables untuk tema
- **Vanilla JavaScript (ES6+)** - Logika aplikasi (tanpa framework)
- **Canvas API** - Rendering pie chart
- **LocalStorage API** - Penyimpanan data lokal

## Struktur Proyek

```
CodingCamp-14sep2026---RenoRayyanPratama-/
├── index.html          # Halaman utama aplikasi
├── css/
│   └── styles.css      # File CSS tunggal
├── js/
│   └── app.js          # File JavaScript tunggal
└── README.md           # Dokumentasi
```

## Cara Menggunakan

### Instalasi
1. Download atau clone repository ini
2. Buka file index.html di browser modern (Chrome, Firefox, Edge, Safari)
3. Tidak perlu instalasi server - aplikasi berjalan sepenuhnya di browser!

### Penggunaan

#### Menambah Transaksi
1. Isi formulir Add Transaction dengan:
   - Amount: Angka negatif untuk pengeluaran, positif untuk pemasukan
   - Category: Pilih dari dropdown
   - Description: Keterangan transaksi
   - Date: Tanggal transaksi
2. Klik tombol Add Transaction
3. Transaksi akan muncul di daftar

#### Menetapkan Anggaran
1. Isi formulir Monthly Budget
2. Masukkan jumlah anggaran bulanan
3. Klik tombol Set Budget
4. Ringkasan akan menampilkan sisa anggaran

#### Menghapus Transaksi
1. Cari transaksi di daftar
2. Klik tombol Delete
3. Transaksi akan dihapus otomatis

#### Beralih Tema
1. Klik tombol toggle tema di header
2. Tema akan berubah antara terang dan gelap
3. Preferensi disimpan otomatis

## Penyimpanan Data

- Semua data disimpan secara lokal menggunakan LocalStorage
- Data tidak dikirim ke server manapun
- Data tetap tersimpan meskipun browser ditutup
- Data spesifik per browser dan perangkat

## Kategori Transaksi

Aplikasi menyediakan 5 kategori default:
1. **Food** (Makanan)
2. **Transport** (Transportasi)
3. **Entertainment** (Hiburan)
4. **Utilities** (Utilitas)
5. **Other** (Lainnya)

## Cara Kerja Ringkasan Bulanan

- **Total Income**: Jumlah semua pemasukan bulan ini
- **Total Expenses**: Jumlah semua pengeluaran bulan ini
- **Remaining Budget**: Anggaran - Total Pengeluaran
- Status ditampilkan dengan warna (hijau: aman, merah: terlampaui)

## Kompatibilitas Browser

Aplikasi kompatibel dengan:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Catatan Teknis

### Validasi Input
- Jumlah harus berupa angka valid
- Kategori harus dipilih
- Tanggal harus diisi
- Anggaran harus positif

### Performa
- Operasi UI < 100ms
- Rendering chart < 200ms
- Tidak ada lag yang terasa

### Keterbatasan
- LocalStorage terbatas 5-10MB
- Data tidak tersinkronisasi antar perangkat
- Tidak ada fitur backup otomatis

## Troubleshooting

### Data tidak tersimpan
- Pastikan LocalStorage tidak diblokir
- Cek mode private/incognito
- Pastikan ada ruang penyimpanan

### Chart tidak muncul
- Refresh halaman (F5)
- Pastikan ada transaksi pengeluaran
- Cek console browser (F12)

## Pengembang

Proyek CodingCamp dengan fokus pada:
- Vanilla JavaScript (tanpa framework)
- Single Page Application
- Client-side data persistence
- Responsive design

---

**Selamat mengelola keuangan Anda!**
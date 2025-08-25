# Panduan Instalasi dan Penggunaan

Ikuti langkah-langkah di bawah ini untuk menginstal dan menjalankan aplikasi.

## 1. Persiapan Lingkungan

Pastikan Anda memiliki Python 3 terinstal di sistem Anda.

### Virtual Environment

Disarankan untuk membuat virtual environment:

```bash
python -m venv venv
```

Aktifkan virtual environment:

- **Windows:**
  ```bash
  .\venv\Scripts\activate
  ```
- **macOS/Linux:**
  ```bash
  source venv/bin/activate
  ```

### Instal Dependensi

Instal semua dependensi yang diperlukan menggunakan `pip`:

```bash
pip install -r requirements.txt
```

## 2. Setup Database (MySQL)

Pastikan database MySQL Anda sudah berjalan dan terkonfigurasi dengan benar. Anda perlu membuat database baru untuk aplikasi ini.

Setelah MySQL berjalan, jalankan migrasi database:

```bash
flask db init
flask db migrate -m "To Seed User"
flask db upgrade
flask seed_user
```

## 3. Menjalankan Aplikasi

### Cara Mudah (Direkomendasikan)

Gunakan script startup otomatis:

```bash
python start_services.py
```

Script ini akan memulai kedua layanan secara otomatis dan memverifikasi bahwa keduanya berjalan dengan benar.

### Cara Manual

Jika Anda ingin menjalankan layanan secara manual, buka dua terminal terpisah dan jalankan perintah berikut di masing-masing terminal:

#### Terminal 1 (FastAPI Server - Sentiment Analysis)

```bash
python server.py
```

#### Terminal 2 (Flask Application - Web Interface)

```bash
python app.py
```

**Penting:** Pastikan FastAPI server (server.py) berjalan terlebih dahulu sebelum menjalankan Flask application (app.py) untuk menghindari error "Terjadi kesalahan saat menyimpan hasil analisis."

## 4. Akses Aplikasi

Setelah kedua server berjalan, Anda bisa mengakses aplikasi melalui browser:

- **Dashboard Flask:** [http://127.0.0.1:5000/](http://127.0.0.1:5000/)
- **FastAPI Documentation (Swagger UI):** [http://127.0.0.1:8888/docs](http://127.0.0.1:8888/docs)

## 5. Login Akun

Untuk login ke dashboard, gunakan kredensial berikut:

- **Username:** `testuser`
- **Password:** `testpass123`

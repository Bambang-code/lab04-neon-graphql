-- =========================================
-- Skema Database Penjualan (3 tabel)
-- =========================================

-- 1. Tabel pelanggan
CREATE TABLE pelanggan (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    no_telepon VARCHAR(20),
    kota VARCHAR(50)
);

-- 2. Tabel produk
CREATE TABLE produk (
    id SERIAL PRIMARY KEY,
    nama_produk VARCHAR(100) NOT NULL,
    kategori VARCHAR(50),
    harga NUMERIC(12,2) NOT NULL,
    stok INT DEFAULT 0
);

-- 3. Tabel penjualan (relasi ke pelanggan & produk)
CREATE TABLE penjualan (
    id SERIAL PRIMARY KEY,
    pelanggan_id INT REFERENCES pelanggan(id),
    produk_id INT REFERENCES produk(id),
    jumlah INT NOT NULL,
    tanggal DATE DEFAULT CURRENT_DATE,
    total NUMERIC(14,2)
);

-- =========================================
-- Isi data: pelanggan (10 baris)
-- =========================================
INSERT INTO pelanggan (nama, email, no_telepon, kota) VALUES
('Budi Santoso', 'budi.santoso@email.com', '081234567801', 'Surabaya'),
('Siti Aminah', 'siti.aminah@email.com', '081234567802', 'Jakarta'),
('Andi Wijaya', 'andi.wijaya@email.com', '081234567803', 'Bandung'),
('Rina Kartika', 'rina.kartika@email.com', '081234567804', 'Surabaya'),
('Dedi Kurniawan', 'dedi.kurniawan@email.com', '081234567805', 'Malang'),
('Wulan Sari', 'wulan.sari@email.com', '081234567806', 'Yogyakarta'),
('Agus Setiawan', 'agus.setiawan@email.com', '081234567807', 'Surabaya'),
('Maya Puspita', 'maya.puspita@email.com', '081234567808', 'Semarang'),
('Rizky Pratama', 'rizky.pratama@email.com', '081234567809', 'Jakarta'),
('Fitri Handayani', 'fitri.handayani@email.com', '081234567810', 'Surabaya');

-- =========================================
-- Isi data: produk (10 baris)
-- =========================================
INSERT INTO produk (nama_produk, kategori, harga, stok) VALUES
('Kopi Susu', 'Minuman', 18000, 100),
('Nasi Goreng', 'Makanan', 22000, 80),
('Mouse Wireless', 'Elektronik', 85000, 40),
('Kaos Polos', 'Fashion', 45000, 60),
('Buku Tulis', 'Alat Tulis', 5000, 200),
('Sepatu Sneakers', 'Fashion', 250000, 25),
('Charger USB-C', 'Elektronik', 60000, 50),
('Teh Botol', 'Minuman', 5000, 150),
('Roti Bakar', 'Makanan', 15000, 70),
('Tas Ransel', 'Fashion', 150000, 30);

-- =========================================
-- Isi data: penjualan (10 baris)
-- =========================================
INSERT INTO penjualan (pelanggan_id, produk_id, jumlah, tanggal, total) VALUES
(1, 1, 3, '2026-08-01', 54000),
(2, 3, 1, '2026-08-02', 85000),
(3, 6, 1, '2026-08-03', 250000),
(4, 2, 2, '2026-08-04', 44000),
(5, 5, 10, '2026-08-05', 50000),
(6, 8, 6, '2026-08-06', 30000),
(7, 7, 2, '2026-08-07', 120000),
(8, 10, 1, '2026-08-08', 150000),
(9, 4, 3, '2026-08-09', 135000),
(10, 9, 4, '2026-08-10', 60000);

-- =========================================
-- Cek hasil
-- =========================================
-- SELECT * FROM pelanggan;
-- SELECT * FROM produk;
-- SELECT * FROM penjualan;
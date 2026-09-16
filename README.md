# Lab 05 - Query dan Mutation Lanjutan GraphQL

Pengembangan lanjutan dari Lab 04 berupa GraphQL API yang terhubung ke
PostgreSQL Neon dan dideploy melalui Vercel. API menggunakan Next.js API Route,
Apollo Server, dan skema `pelanggan`, `produk`, serta `penjualan`.

## Identitas

- Nama: Bambang Herlambang
- NRP: 503024019

## Deployment

- Endpoint GraphQL:
  [https://lab04-neon-graphql.vercel.app/api/graphql](https://lab04-neon-graphql.vercel.app/api/graphql)
- Apollo Sandbox:
  [Buka GraphQL Explorer](https://studio.apollographql.com/sandbox/explorer?endpoint=https://lab04-neon-graphql.vercel.app/api/graphql)

Endpoint telah mengaktifkan introspection dan CORS untuk
`studio.apollographql.com`, sehingga dapat diuji langsung melalui Apollo
Sandbox.

## Fitur

### Query

- Menampilkan seluruh data pelanggan, produk, dan penjualan.
- Mencari pelanggan, produk, atau penjualan berdasarkan ID.
- Memfilter produk berdasarkan kategori melalui `produk(kategori: String)`.
- Menampilkan relasi antartabel melalui nested query:
  `penjualan -> pelanggan` dan `penjualan -> produk`.

### Mutation

- `createProduk` untuk menambahkan produk ke Neon.
- `updateProduk` untuk memperbarui sebagian atau seluruh data produk.
- `deleteProduk` untuk menghapus produk berdasarkan ID.

Semua operasi database menggunakan parameterized query. Mutation update
memakai `COALESCE` agar field yang tidak dikirim tidak menimpa nilai lama.

## Teknologi

- Next.js 16
- Apollo Server 5
- GraphQL
- PostgreSQL Neon
- Vercel

## Menjalankan Secara Lokal

1. Instal dependency:

   ```bash
   npm install
   ```

2. Salin konfigurasi environment:

   ```bash
   cp .env.example .env.local
   ```

3. Isi `DATABASE_URL` pada `.env.local` menggunakan connection string Neon
   versi pooled.

4. Jalankan development server:

   ```bash
   npm run dev
   ```

5. Buka `http://localhost:3000/api/graphql`.

## Contoh Operasi

### Filter Produk

```graphql
query {
  produk(kategori: "Minuman") {
    id
    namaProduk
    kategori
    harga
    stok
  }
}
```

### Membuat Produk

```graphql
mutation {
  createProduk(
    input: {
      namaProduk: "Produk Latihan Mandiri"
      kategori: "Latihan Mandiri"
      harga: 10000
      stok: 5
    }
  ) {
    id
    namaProduk
    kategori
    harga
    stok
  }
}
```

### Memperbarui Produk

```graphql
mutation {
  updateProduk(
    id: "19"
    input: {
      namaProduk: "Produk Latihan Mandiri Updated"
      harga: 12500
      stok: 8
    }
  ) {
    id
    namaProduk
    kategori
    harga
    stok
  }
}
```

### Menghapus Produk

```graphql
mutation {
  deleteProduk(id: "19")
}
```

### Query Relasi

```graphql
query {
  penjualan {
    id
    jumlah
    total
    status
    pelanggan {
      id
      nama
      kota
    }
    produk {
      id
      namaProduk
      kategori
      harga
    }
  }
}
```

## Bukti Latihan Mandiri

Enam langkah pengujian dilakukan dengan pola mutation lalu query ulang:

1. Membuat produk.
2. Memastikan produk muncul pada query.
3. Memperbarui produk.
4. Memastikan perubahan tersimpan.
5. Menghapus produk.
6. Memastikan produk sudah tidak tersedia.

Dokumentasi lengkap tersedia pada:

- [Screenshot dan operasi GraphQL](./bukti-latihan/README.md)
- [Laporan PDF](./output/pdf/Laporan_Tugas_Sesi_5_Bambang_Herlambang.pdf)

## Refleksi

Mutation GraphQL lebih rumit daripada endpoint REST biasa karena input type,
tipe hasil, resolver, dan selection set harus didefinisikan secara konsisten.
GraphQL tetap lebih fleksibel karena client dapat memilih field hasil yang
dibutuhkan melalui satu endpoint. Keberhasilan mutation juga perlu diverifikasi
dengan query ulang agar perubahan pada database benar-benar terbukti tersimpan.

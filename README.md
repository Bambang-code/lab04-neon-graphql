# Lab 07 - OAuth2 untuk GraphQL API

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

Ketiga mutation memerlukan JWT aplikasi yang didapat setelah login GitHub.
Query tetap bisa digunakan tanpa login.

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
   versi pooled. Tambahkan `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`,
   `CALLBACK_URL`, dan `JWT_SECRET` sesuai contoh.

4. Buat GitHub OAuth App di **Settings → Developer settings → OAuth Apps**.
   Isi Homepage URL dengan `https://lab04-neon-graphql.vercel.app` dan
   Authorization callback URL dengan
   `https://lab04-neon-graphql.vercel.app/auth/callback`. Tambahkan
   `http://localhost:3000/auth/callback` sebagai callback kedua jika ingin
   menguji lokal. Atur empat environment variable yang sama di
   **Vercel → Project Settings → Environment Variables** (Production).
   Nilai `CALLBACK_URL` harus sesuai dengan lingkungan yang sedang dipakai.

5. Jalankan development server:

   ```bash
   npm run dev
   ```

6. Buka `http://localhost:3000/auth/login`, login di GitHub, lalu salin
   nilai `token` dari respons callback. Token berlaku satu jam.

7. Buka `http://localhost:3000/api/graphql` atau Apollo Sandbox. Tambahkan
   header `Authorization: Bearer <token>` saat menjalankan mutation.
   Coba lagi tanpa header untuk melihat galat `UNAUTHENTICATED`.

Alur login menggunakan authorization code GitHub dengan `state` dan PKCE.
Server menukar code dengan access token, mengambil profil `/user`, lalu
menerbitkan JWT aplikasi. Access token GitHub tidak dikirim ke client. Endpoint
`/auth/login` dan `/auth/callback` adalah URL publik yang diteruskan ke
API route Next.js.

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

Jalankan setelah menambahkan header `Authorization`.

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

## Latihan Mandiri Sesi 07

Screenshot mutation tanpa token dan refleksi singkat tersedia di
[bukti-sesi07/README.md](./bukti-sesi07/README.md). Screenshot sukses masih
memerlukan GitHub OAuth App dan login sungguhan; JWT dari respons callback
tidak boleh disertakan dalam screenshot atau commit.

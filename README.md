# Lab 04 — GraphQL API (Vercel + Neon)

Versi Vercel dari project Lab 04. Schema & resolver-nya identik dengan
versi Render, cuma cara membungkusnya beda: pakai Next.js API route
(`pages/api/graphql.js`) lewat `@as-integrations/next`, sesuai panduan
alternatif deployment di modul lab.

Skema: `pelanggan`, `produk`, `penjualan` (dari `schema.sql` kelompok —
bukan tabel contoh modul). Relasi `penjualan → pelanggan`,
`penjualan → produk`, dan arah baliknya, semua punya resolver sendiri.

## 1. Ambil connection string versi POOLED

Di dashboard Neon → Connect → Postgres database, **nyalakan toggle
"Connection pooling"**. Hostname-nya akan berubah jadi ada akhiran
`-pooler`, misalnya:

```
postgresql://neondb_owner:xxxx@ep-xxxx-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Ini beda dari versi yang dipakai di project Render — Vercel itu
serverless, jadi butuh connection pooling supaya tidak cepat kehabisan
koneksi ke Neon.

## 2. Jalankan lokal

```bash
npm install
cp .env.example .env.local
# edit .env.local, isi DATABASE_URL dengan connection string pooled tadi
npm run dev
```

Buka `http://localhost:3000/api/graphql` untuk masuk ke Apollo Sandbox
bawaan Apollo Server.

Catatan: Next.js baca env var dari `.env.local`, **bukan** `.env` biasa.

## 3. Contoh nested query

```graphql
query {
  penjualan {
    id
    jumlah
    total
    status
    pelanggan {
      nama
      kota
    }
    produk {
      namaProduk
      harga
    }
  }
}
```

## 4. Mutation dan filter produk (Lab 05)

API mendukung penambahan, perubahan, dan penghapusan produk langsung di
Neon melalui mutation `createProduk`, `updateProduk`, dan `deleteProduk`.
Query `produk` juga dapat difilter memakai argumen kategori, misalnya:

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

Contoh mutation:

```graphql
mutation {
  createProduk(
    input: {
      namaProduk: "Produk Uji"
      kategori: "Latihan"
      harga: 10000
      stok: 5
    }
  ) {
    id
    namaProduk
  }
}
```

## 5. Deploy ke Vercel

**Lewat dashboard (tanpa CLI):**

1. Push folder ini ke repo GitHub baru (repo terpisah dari yang dipakai
   untuk versi Render, atau branch terpisah — jangan dicampur).
2. Buka [vercel.com](https://vercel.com) → login pakai akun GitHub →
   **Add New... → Project**.
3. Pilih repo-nya → Vercel otomatis mendeteksi framework Next.js, biarkan
   default (Build Command `next build`, Output otomatis).
4. Di bagian **Environment Variables**, tambahkan:
   - Key: `DATABASE_URL`
   - Value: connection string pooled dari langkah 1
5. Klik **Deploy**. Tidak perlu kartu kredit untuk tier Hobby (gratis).
6. Setelah selesai, buka
   `https://<nama-project>.vercel.app/api/graphql` untuk cek Sandbox-nya
   jalan.

**Lewat CLI (opsional):**

```bash
npm install -g vercel
vercel
vercel env add DATABASE_URL
vercel --prod
```

## 6. Link submission

```
https://studio.apollographql.com/sandbox/explorer?endpoint=https://<nama-project>.vercel.app/api/graphql
```

CORS di `pages/api/graphql.js` sudah diset untuk mengizinkan domain
`studio.apollographql.com`, jadi link ini bisa dibuka dosen tanpa error
cross-origin.

## 7. Refleksi (tulis sendiri, 3–5 kalimat)

Sama seperti versi Render — bandingkan jumlah field yang dikembalikan
`{ produk { namaProduk } }` di GraphQL vs REST endpoint biasa. Tulis versi
kamu sendiri berdasarkan hasil coba-coba di Sandbox.

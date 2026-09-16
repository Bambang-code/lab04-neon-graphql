# Bukti Latihan Mandiri Lab 05

Apollo Sandbox:
[Buka endpoint deployment](https://studio.apollographql.com/sandbox/explorer?endpoint=https://lab04-neon-graphql.vercel.app/api/graphql)

Latihan menggunakan produk uji dengan ID `18` dan kategori
`Latihan Mandiri`. Nama operasi disesuaikan dengan schema proyek Lab 04,
yaitu `createProduk`, `updateProduk`, dan `deleteProduk`.

## Enam langkah pengujian

1. `createProduk` berhasil membuat produk ID `18`.
   [Screenshot](./01-create-produk.png)
2. Query kategori menampilkan produk yang baru dibuat.
   [Screenshot](./02-query-setelah-create.png)
3. `updateProduk` mengubah nama, harga dari `10000` menjadi `12500`, dan
   stok dari `5` menjadi `8`.
   [Screenshot](./03-update-produk.png)
4. Query ulang menampilkan nilai yang sudah diperbarui.
   [Screenshot](./04-query-setelah-update.png)
5. `deleteProduk` mengembalikan nilai `true`.
   [Screenshot](./05-delete-produk.png)
6. Query terakhir mengembalikan array kosong (`produk: []`).
   [Screenshot](./06-query-setelah-delete.png)

## Operasi GraphQL

```graphql
mutation {
  createProduk(
    input: {
      namaProduk: "Produk Latihan Mandiri Apollo"
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

```graphql
query {
  produk(kategori: "Latihan Mandiri") {
    id
    namaProduk
    kategori
    harga
    stok
  }
}
```

```graphql
mutation {
  updateProduk(
    id: "18"
    input: {
      namaProduk: "Produk Latihan Mandiri Apollo Updated"
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

```graphql
mutation {
  deleteProduk(id: "18")
}
```

## Refleksi

Mutation GraphQL lebih rumit daripada endpoint REST biasa karena input type,
tipe return, resolver, dan selection set harus didefinisikan serta saling
sesuai. Namun, GraphQL memberi fleksibilitas karena client dapat memilih field
hasil yang dibutuhkan dan seluruh operasi tersedia melalui satu endpoint.
Verifikasi mutation juga perlu dilakukan dengan query ulang agar perubahan di
database benar-benar terbukti tersimpan.

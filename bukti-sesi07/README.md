# Bukti Latihan Mandiri Sesi 07

## Screenshot yang dikumpulkan

1. [`01-mutation-tanpa-authorization.png`](./01-mutation-tanpa-authorization.png):
   hasil `createProduk` tanpa header `Authorization` menunjukkan
   `UNAUTHENTICATED`. Screenshot diambil dari Apollo Sandbox yang terhubung
   ke deployment Vercel.
2. [`02-mutation-dengan-jwt.png`](./02-mutation-dengan-jwt.png):
   setelah login melalui `/auth/login`, JWT dari `/auth/callback` dipasang
   sebagai header `Authorization: Bearer <token>` di Apollo Sandbox.
   Mutation `createProduk` berhasil dan mengembalikan data produk.

Nilai token pada panel header disamarkan agar kredensial tidak terekam.
Produk uji dihapus dengan `deleteProduk` menggunakan JWT yang sama setelah
screenshot diambil.

## Refleksi

Bagian yang paling membingungkan adalah membedakan authorization code,
access token GitHub, dan JWT aplikasi karena ketiganya muncul pada tahap yang
berbeda. Authorization code hanya dipakai server untuk menukar token di GitHub;
resolver GraphQL memeriksa JWT aplikasi yang diterbitkan setelah profil
pengguna berhasil diambil.

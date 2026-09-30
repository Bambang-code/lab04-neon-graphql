# Bukti Latihan Mandiri Sesi 07

## Screenshot yang dikumpulkan

1. [`01-mutation-tanpa-authorization.png`](./01-mutation-tanpa-authorization.png):
   hasil `createProduk` tanpa header `Authorization` menunjukkan
   `UNAUTHENTICATED`. Screenshot diambil dari Apollo Sandbox yang terhubung
   ke server lokal.
2. `02-mutation-dengan-jwt.png` (belum diambil): login melalui `/auth/login`, salin JWT
   dari `/auth/callback`, pasang header `Authorization: Bearer <token>`
   di Apollo Sandbox, lalu jalankan `createProduk` dan tangkap hasilnya.

Sebelum mengambil screenshot kedua, sembunyikan nilai token pada panel header
agar kredensial tidak terekam. Setelahnya, hapus produk uji dengan
`deleteProduk` menggunakan JWT yang sama.

## Refleksi

Bagian yang paling membingungkan adalah membedakan authorization code,
access token GitHub, dan JWT aplikasi karena ketiganya muncul pada tahap yang
berbeda. Authorization code hanya dipakai server untuk menukar token di GitHub;
resolver GraphQL memeriksa JWT aplikasi yang diterbitkan setelah profil
pengguna berhasil diambil.

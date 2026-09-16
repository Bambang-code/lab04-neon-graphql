import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { Pool } from "pg";

// ---------------------------------------------------------------
// Koneksi ke Neon — WAJIB pakai connection string versi POOLED
// (hostname yang ada akhiran -pooler), karena serverless function
// di Vercel bisa memicu banyak koneksi baru sekaligus.
// ---------------------------------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ---------------------------------------------------------------
// Schema — sama persis dengan versi Render, dipetakan dari
// schema.sql kelompok: pelanggan, produk, penjualan
// ---------------------------------------------------------------
const typeDefs = `#graphql
  type Pelanggan {
    id: ID!
    nama: String!
    email: String
    noTelepon: String
    kota: String
    penjualan: [Penjualan!]!
  }

  type Produk {
    id: ID!
    namaProduk: String!
    kategori: String
    harga: Float!
    stok: Int!
    penjualan: [Penjualan!]!
  }

  type Penjualan {
    id: ID!
    jumlah: Int!
    tanggal: String
    total: Float
    status: String!
    pelanggan: Pelanggan!
    produk: Produk!
  }

  input CreateProdukInput {
    namaProduk: String!
    kategori: String
    harga: Float!
    stok: Int! = 0
  }

  input UpdateProdukInput {
    namaProduk: String
    kategori: String
    harga: Float
    stok: Int
  }

  type Query {
    pelanggan: [Pelanggan!]!
    pelangganById(id: ID!): Pelanggan
    produk(kategori: String): [Produk!]!
    produkById(id: ID!): Produk
    penjualan: [Penjualan!]!
    penjualanById(id: ID!): Penjualan
  }

  type Mutation {
    createProduk(input: CreateProdukInput!): Produk!
    updateProduk(id: ID!, input: UpdateProdukInput!): Produk
    deleteProduk(id: ID!): Boolean!
  }
`;

// ---------------------------------------------------------------
// Latihan Mandiri Sesi 05 — counter untuk membuktikan N+1 Problem
// pada resolver relasi Pelanggan.penjualan.
// queryPelangganCallCount  -> berapa kali resolver ROOT (Query.pelanggan) dipanggil (harus selalu 1)
// pelangganPenjualanResolverCallCount -> berapa kali resolver RELASI (Pelanggan.penjualan) dipanggil (harus = N, jumlah pelanggan)
// ---------------------------------------------------------------
let queryPelangganCallCount = 0;
let pelangganPenjualanResolverCallCount = 0;

// ---------------------------------------------------------------
// Resolvers — identik dengan versi Render
// ---------------------------------------------------------------
const resolvers = {
  Query: {
    pelanggan: async () => {
      queryPelangganCallCount++;
      console.log(
        `[N+1 counter] Query.pelanggan (ROOT) dipanggil — total: ${queryPelangganCallCount}`,
      );
      const result = await pool.query("SELECT * FROM pelanggan ORDER BY id");
      return result.rows;
    },
    pelangganById: async (_, { id }) => {
      const result = await pool.query("SELECT * FROM pelanggan WHERE id = $1", [
        id,
      ]);
      return result.rows[0];
    },
    produk: async (_, { kategori }) => {
      const result = kategori
        ? await pool.query(
            "SELECT * FROM produk WHERE kategori = $1 ORDER BY id",
            [kategori],
          )
        : await pool.query("SELECT * FROM produk ORDER BY id");
      return result.rows;
    },
    produkById: async (_, { id }) => {
      const result = await pool.query("SELECT * FROM produk WHERE id = $1", [
        id,
      ]);
      return result.rows[0];
    },
    penjualan: async () => {
      const result = await pool.query("SELECT * FROM penjualan ORDER BY id");
      return result.rows;
    },
    penjualanById: async (_, { id }) => {
      const result = await pool.query("SELECT * FROM penjualan WHERE id = $1", [
        id,
      ]);
      return result.rows[0];
    },
  },

  Mutation: {
    createProduk: async (_, { input }) => {
      const result = await pool.query(
        `INSERT INTO produk (nama_produk, kategori, harga, stok)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [input.namaProduk, input.kategori ?? null, input.harga, input.stok],
      );
      return result.rows[0];
    },
    updateProduk: async (_, { id, input }) => {
      const result = await pool.query(
        `UPDATE produk
         SET nama_produk = COALESCE($1, nama_produk),
             kategori = COALESCE($2, kategori),
             harga = COALESCE($3, harga),
             stok = COALESCE($4, stok)
         WHERE id = $5
         RETURNING *`,
        [
          input.namaProduk ?? null,
          input.kategori ?? null,
          input.harga ?? null,
          input.stok ?? null,
          id,
        ],
      );
      return result.rows[0] ?? null;
    },
    deleteProduk: async (_, { id }) => {
      const result = await pool.query("DELETE FROM produk WHERE id = $1", [
        id,
      ]);
      return result.rowCount > 0;
    },
  },

  Pelanggan: {
    noTelepon: (parent) => parent.no_telepon,
    penjualan: async (parent) => {
      pelangganPenjualanResolverCallCount++;
      console.log(
        `[N+1 counter] Pelanggan.penjualan (RELASI) dipanggil untuk pelanggan id=${parent.id} (${parent.nama}) — total: ${pelangganPenjualanResolverCallCount}`,
      );
      const result = await pool.query(
        "SELECT * FROM penjualan WHERE pelanggan_id = $1 ORDER BY id",
        [parent.id],
      );
      return result.rows;
    },
  },

  Produk: {
    namaProduk: (parent) => parent.nama_produk,
    harga: (parent) => parseFloat(parent.harga),
    penjualan: async (parent) => {
      const result = await pool.query(
        "SELECT * FROM penjualan WHERE produk_id = $1 ORDER BY id",
        [parent.id],
      );
      return result.rows;
    },
  },

  Penjualan: {
    total: (parent) =>
      parent.total !== null ? parseFloat(parent.total) : null,
    tanggal: (parent) =>
      parent.tanggal instanceof Date
        ? parent.tanggal.toISOString().split("T")[0]
        : parent.tanggal,
    pelanggan: async (parent) => {
      const result = await pool.query("SELECT * FROM pelanggan WHERE id = $1", [
        parent.pelanggan_id,
      ]);
      return result.rows[0];
    },
    produk: async (parent) => {
      const result = await pool.query("SELECT * FROM produk WHERE id = $1", [
        parent.produk_id,
      ]);
      return result.rows[0];
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // wajib nyala supaya Apollo Sandbox dosen bisa introspeksi schema
});

const apolloHandler = startServerAndCreateNextHandler(server);

// ---------------------------------------------------------------
// Bungkus dengan CORS manual, karena Next.js API route tidak
// otomatis izinkan cross-origin request. Ini yang bikin link
// Apollo Sandbox (studio.apollographql.com) bisa connect ke sini.
// ---------------------------------------------------------------
export default async function handler(req, res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://studio.apollographql.com",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Apollo-Require-Preflight",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  return apolloHandler(req, res);
}

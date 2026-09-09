import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { Pool } from 'pg';

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

  type Query {
    pelanggan: [Pelanggan!]!
    pelangganById(id: ID!): Pelanggan
    produk: [Produk!]!
    produkById(id: ID!): Produk
    penjualan: [Penjualan!]!
    penjualanById(id: ID!): Penjualan
  }
`;

// ---------------------------------------------------------------
// Resolvers — identik dengan versi Render
// ---------------------------------------------------------------
const resolvers = {
  Query: {
    pelanggan: async () => {
      const result = await pool.query('SELECT * FROM pelanggan ORDER BY id');
      return result.rows;
    },
    pelangganById: async (_, { id }) => {
      const result = await pool.query('SELECT * FROM pelanggan WHERE id = $1', [id]);
      return result.rows[0];
    },
    produk: async () => {
      const result = await pool.query('SELECT * FROM produk ORDER BY id');
      return result.rows;
    },
    produkById: async (_, { id }) => {
      const result = await pool.query('SELECT * FROM produk WHERE id = $1', [id]);
      return result.rows[0];
    },
    penjualan: async () => {
      const result = await pool.query('SELECT * FROM penjualan ORDER BY id');
      return result.rows;
    },
    penjualanById: async (_, { id }) => {
      const result = await pool.query('SELECT * FROM penjualan WHERE id = $1', [id]);
      return result.rows[0];
    },
  },

  Pelanggan: {
    noTelepon: (parent) => parent.no_telepon,
    penjualan: async (parent) => {
      const result = await pool.query(
        'SELECT * FROM penjualan WHERE pelanggan_id = $1 ORDER BY id',
        [parent.id]
      );
      return result.rows;
    },
  },

  Produk: {
    namaProduk: (parent) => parent.nama_produk,
    harga: (parent) => parseFloat(parent.harga),
    penjualan: async (parent) => {
      const result = await pool.query(
        'SELECT * FROM penjualan WHERE produk_id = $1 ORDER BY id',
        [parent.id]
      );
      return result.rows;
    },
  },

  Penjualan: {
    total: (parent) => (parent.total !== null ? parseFloat(parent.total) : null),
    tanggal: (parent) =>
      parent.tanggal instanceof Date
        ? parent.tanggal.toISOString().split('T')[0]
        : parent.tanggal,
    pelanggan: async (parent) => {
      const result = await pool.query('SELECT * FROM pelanggan WHERE id = $1', [
        parent.pelanggan_id,
      ]);
      return result.rows[0];
    },
    produk: async (parent) => {
      const result = await pool.query('SELECT * FROM produk WHERE id = $1', [
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
  res.setHeader('Access-Control-Allow-Origin', 'https://studio.apollographql.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Apollo-Require-Preflight');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return apolloHandler(req, res);
}

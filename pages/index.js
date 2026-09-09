export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: '3rem', maxWidth: 640 }}>
      <h1>Lab 04 — GraphQL API</h1>
      <p>
        Server GraphQL untuk skema <code>pelanggan</code>, <code>produk</code>,{' '}
        <code>penjualan</code>.
      </p>
      <p>
        Endpoint GraphQL ada di{' '}
        <a href="/api/graphql">
          <code>/api/graphql</code>
        </a>
        .
      </p>
    </main>
  );
}

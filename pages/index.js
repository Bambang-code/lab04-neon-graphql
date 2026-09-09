export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "3rem", maxWidth: 640 }}>
      <h1>Lab 04 — GraphQL API</h1>
      <p>
        Server GraphQL untuk skema <code>pelanggan</code>, <code>produk</code>,{" "}
        <code>penjualan</code>.
      </p>
      <p>
        Endpoint GraphQL ada di{" "}
        <a
          href="https://studio.apollographql.com/sandbox/explorer?endpoint=https://lab04-neon-graphql.vercel.app/api/graphql"
          target="_blank"
          rel="noopener noreferrer"
        >
          <code>/api/graphql</code>
        </a>
        . Klik untuk mencoba query lewat Apollo Sandbox.
      </p>
    </main>
  );
}

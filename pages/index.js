export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "3rem", maxWidth: 640 }}>
      <h1>Lab 07 — OAuth2 untuk GraphQL API</h1>
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
      <p>
        Untuk menjalankan mutation produk, <a href="/auth/login">login lewat GitHub</a>,
        lalu salin JWT yang ditampilkan sebagai header{" "}
        <code>Authorization: Bearer &lt;token&gt;</code> di Apollo Sandbox.
      </p>
    </main>
  );
}

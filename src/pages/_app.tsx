// src/pages/_app.tsx
import "../styles/globals.css";    // <-- here
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <Component {...pageProps} />
    </main>
  );
}

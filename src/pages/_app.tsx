// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css" // adjust path if you use a different styles folder

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main>
      <Component {...pageProps} />
    </main>
  );
}

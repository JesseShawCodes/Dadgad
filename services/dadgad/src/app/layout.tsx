import type { Metadata } from "next";
import "./globals.css";
import "./App.scss";
import NavBar from "./NavBar";
import FloatingControls from "./components/FloatingControls/FloatingControls";
import Footer from "./components/Footer";
import { ReduxProvider } from "./ReduxProvider";
import Head from "next/head";
import { ThemeProvider } from "./ThemeContext";

export const metadata = {
  title: "Dadgad",
  description: "Build the Ultimate Song Bracket for Your Favorite Artist. Pick your favorites, round by round. Crown your winner. Share your bracket with the world.",
  icons: {
    icon: [
      { url: 'icon.png', type: 'image/png' }
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const mainLayout = (
    <ReduxProvider>
      <ThemeProvider>
      <div>
        <NavBar />
        <main className="bg-my-gradient">
          {children}
        </main>
        <FloatingControls />
        <Footer />
      </div>
      </ThemeProvider>
    </ReduxProvider>
  )
  return (
    <html lang="en">
      <Head>
        <meta name="theme-color" content="#ff06f8"/>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dadgad"/>
      </Head>
      <body>
        { process.env.NEXT_PUBLIC_MAINTENANCE_MODE ? <h1>MAIN</h1> : mainLayout }
      </body>
    </html>
  );
}

import "./globals.css";
import "./App.scss";
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import NavBar from "./NavBar";
import { ReduxProvider } from "./ReduxProvider";
import { ThemeProvider } from "./ThemeContext";
import Footer from "./components/Footer";
import { BracketContext } from "./context/BracketContext";
import BootstrapClient from "./components/BootstrapClient";
import FloatingControls from './components/FloatingControls/FloatingControls';
import MaintenancePageContent from "./components/MaintenancePageContent";
import Head from "next/head";

export const metadata = {
  title: "Dadgad",
  description: "Build the Ultimate Song Bracket for Your Favorite Artist. Pick your favorites, round by round. Crown your winner. Share your bracket with the world.",
  icons: {
    icon: [
      { url: 'icon.png', type: 'image/png' }
    ]
  }
};

export default function RootLayout({ children }) {
  const mainLayout = (
    <ReduxProvider>
      <BracketContext>
      <ThemeProvider>
        <div className="d-flex flex-column min-vh-100">
          <NavBar />
          <main className="flex-grow-1 bg-my-gradient">
            {children}
          </main>
          <FloatingControls />
          <Footer />
        </div>
        <BootstrapClient />
      </ThemeProvider>
      </BracketContext>
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
        { process.env.NEXT_PUBLIC_MAINTENANCE_MODE ? <MaintenancePageContent /> : mainLayout}
      </body>
    </html>
  );
}

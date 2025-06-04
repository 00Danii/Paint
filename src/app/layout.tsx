import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Pizarrón",
  description: "Hola esto es un pizarrón ",
  openGraph: {
    title: "Pizarrón",
    description: "Hola esto es un pizarrón",
    url: "",
    siteName: "00Danii",
    images: [
      {
        url: "https://i.imgur.com/HqFHjyT.jpeg",
        width: 1200,
        height: 630,
        alt: "Vista previa del pizarrón",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

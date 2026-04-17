import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "qa-app — monitoring vývojových prostředí",
    template: "%s · qa-app",
  },
  description:
    "Sjednocený pohled na stav aplikací napříč vývojovými prostředími — pro vývojáře, product ownera, testery i koncové uživatele.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

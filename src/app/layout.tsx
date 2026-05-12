import type { Metadata } from "next";
import "./globals.css";
import { getBrandSettings, hexToHslString, shiftLightness } from "@/lib/branding";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandSettings();
  return {
    title: {
      default: `${brand.productName} — sjednocený pohled na zdraví aplikací napříč SDLC`,
      template: `%s · ${brand.productName}`,
    },
    description: `${brand.productName} sjednocuje signály z verzování, CI/CD, testů, releasů, observability a feedbacku do jednoho přehledu pro vývojáře, product ownery, testery i koncové uživatele.`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brand = await getBrandSettings();
  const darkThemes: string[] = ["vercel", "linear", "grafana", "datadog", "github", "supabase", "railway"];
  const isDarkTheme = darkThemes.includes(brand.style);

  const cssVars = `:root {
  --brand-primary: ${hexToHslString(brand.primary)};
  --brand-secondary: ${hexToHslString(brand.secondary)};
  --brand-tertiary: ${hexToHslString(brand.tertiary)};
  --primary: ${hexToHslString(brand.primary)};
  --ring: ${hexToHslString(brand.primary)};
}
.theme-noir, .theme-terminal, .theme-glass, .theme-neon, .theme-ember {
  --brand-primary: ${shiftLightness(brand.primary, 0.16)};
  --brand-secondary: ${shiftLightness(brand.secondary, 0.0)};
  --brand-tertiary: ${shiftLightness(brand.tertiary, 0.0)};
  --primary: ${shiftLightness(brand.primary, 0.16)};
  --ring: ${shiftLightness(brand.primary, 0.16)};
}`;

  return (
    <html
      lang="cs"
      className={`h-full antialiased${isDarkTheme ? " dark" : ""} theme-${brand.style}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={brand.primary} />
        <style id="brand-vars" dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

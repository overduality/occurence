import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Occuring",
  description: "Personal focus & sprint management system.",
  icons: {
    icon: "/icon.svg",
  },
};

const DISPLAY_PREFS_INIT_SCRIPT = `
try {
  var saved = localStorage.getItem("color-scheme");
  if (saved === "light" || saved === "dark") {
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.content = saved;
  }
  if (localStorage.getItem("occuring-reduce-transparency") === "1") {
    document.documentElement.setAttribute("data-reduce-transparency", "true");
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: DISPLAY_PREFS_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-app text-ink-primary antialiased">
        {/* Hidden SVG Optical Refraction Filter for Apple Liquid Glass Navigation Surfaces */}
        <svg
          aria-hidden="true"
          className="pointer-events-none fixed h-0 w-0 overflow-hidden opacity-0"
        >
          <defs>
            <filter
              id="apple-liquid-refraction"
              x="-5%"
              y="-5%"
              width="110%"
              height="110%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012"
                numOctaves={2}
                seed={7}
                result="lensNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="lensNoise"
                scale={2.5}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}

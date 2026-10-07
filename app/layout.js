import "./globals.css";

export const metadata = {
  title: "Historias con Gemini",
  description: "Un pequeño rincón para imaginar",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

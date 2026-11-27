import "./globals.css";
export const metadata = {
  title: "ScholarShield | Scholarship screening",
  description:
    "A transparent, rule-based scholarship screening university project.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

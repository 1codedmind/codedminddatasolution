import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Generator — Strong Random Passwords, Free",
  description:
    "Generate strong, random passwords with custom length and character rules. Choose uppercase, lowercase, numbers, and symbols. Generated locally — never sent to any server.",
  keywords: [
    "password generator",
    "random password generator",
    "strong password generator online",
    "secure password generator",
    "generate password free",
    "password creator online",
  ],
  alternates: { canonical: "https://codedmind.co.in/tools/password-generator" },
  openGraph: {
    title: "Password Generator — Strong Random Passwords Online",
    description: "Generate strong, random passwords locally in your browser. Custom length and character rules. Free, private.",
    url: "https://codedmind.co.in/tools/password-generator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Password Generator",
            url: "https://codedmind.co.in/tools/password-generator",
            applicationCategory: "SecurityApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: "Generate strong, random passwords locally. Custom length and character rules. Never sent to a server.",
            featureList: [
              "Custom password length",
              "Uppercase letters",
              "Lowercase letters",
              "Numbers and symbols",
              "Generated locally — never transmitted",
            ],
          }),
        }}
      />
    </>
  );
}

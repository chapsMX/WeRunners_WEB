import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "/terms-of-service");
}

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lime">
          <h1>Terms of Service</h1>
          <p className="text-slate-400 text-sm">
            Last updated: January 2026 | Jurisdiction: Mexico City, Mexico
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using w3runn3rs (&ldquo;the Service&rdquo;), you
            agree to be bound by these Terms of Service. If you do not agree,
            please do not use the Service.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least <strong>18 years old</strong> to use the
            Service. By using the Service, you represent that you meet this
            requirement.
          </p>

          <h2>3. One Runner, One Club</h2>
          <p>
            A core rule of the w3runn3rs platform is that each runner may belong
            to only one club at a time. This policy is fundamental to the
            platform&apos;s competitive integrity and cannot be circumvented.
            Club switching is permitted with restrictions; details will be
            available at launch.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Falsify activity data or manipulate leaderboards</li>
            <li>Harass, abuse, or harm other users</li>
            <li>
              Attempt to gain unauthorized access to any part of the Service
            </li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            All content, logos, and trademarks on w3runn3rs are the property of
            w3runn3rs or its licensors. You may not use them without written
            permission.
          </p>

          <h2>6. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; without warranties of
            any kind. We do not guarantee uninterrupted access or error-free
            operation.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, w3runn3rs shall not be
            liable for any indirect, incidental, or consequential damages
            arising from your use of the Service.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These Terms are governed by the laws of <strong>Mexico</strong>,
            with jurisdiction in <strong>Mexico City, Mexico</strong>.
          </p>

          <h2>9. Contact</h2>
          <p>
            For legal inquiries:{" "}
            <a href="mailto:data@w3runn3rs.com">data@w3runn3rs.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

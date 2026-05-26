import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lime">
          <h1>Privacy Policy</h1>
          <p className="text-slate-400 text-sm">
            Last updated: January 2026 | Jurisdiction: Mexico City, Mexico
          </p>

          <h2>1. Who we are</h2>
          <p>
            W3Runn3rs operates the website{" "}
            <strong>www.w3runn3rs.com</strong> (the &ldquo;Service&rdquo;). For
            questions or data requests, contact us at{" "}
            <a href="mailto:data@w3runn3rs.com">data@w3runn3rs.com</a>.
          </p>

          <h2>2. Information we collect</h2>
          <p>We collect information you provide directly, including:</p>
          <ul>
            <li>Email address (waitlist, contact forms, ambassador applications)</li>
            <li>Name (optional, for waitlist and ambassador forms)</li>
            <li>Social media handles (ambassador applications)</li>
            <li>Country of residence (ambassador applications)</li>
          </ul>

          <h2>3. How we use your information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Manage the waitlist and send launch communications</li>
            <li>Process ambassador applications</li>
            <li>Improve our platform and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Cookies and Analytics</h2>
          <p>
            We use <strong>Google Analytics 4</strong> (tracking ID:{" "}
            <code>G-0SQR3G71T8</code>) to analyze website traffic and usage
            patterns. Google Analytics uses cookies — small text files stored on
            your device — to collect anonymous usage data. You can opt out via{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google&apos;s opt-out browser add-on
            </a>
            .
          </p>

          <h2>5. Data retention</h2>
          <p>
            We retain your data for as long as necessary to provide our
            services. You may request deletion at any time by contacting{" "}
            <a href="mailto:data@w3runn3rs.com">data@w3runn3rs.com</a>.
          </p>

          <h2>6. Minimum age</h2>
          <p>
            Our services are intended for users who are at least{" "}
            <strong>18 years old</strong>. We do not knowingly collect personal
            information from minors.
          </p>

          <h2>7. Your rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data.
            To exercise these rights, contact us at{" "}
            <a href="mailto:data@w3runn3rs.com">data@w3runn3rs.com</a>.
          </p>

          <h2>8. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated date.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

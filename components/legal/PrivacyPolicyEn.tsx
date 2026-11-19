// Privacy Policy — English. Keep in sync with PrivacyPolicyEs.tsx.
const CONTACT = "run@w3runn3rs.com"

export function PrivacyPolicyEn() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-slate-400 text-sm">Last updated: November 19, 2026 | Mexico City, Mexico</p>

      <p>
        This policy explains what personal data W3Runn3rs collects, what we use it for, what other people can see, and
        how you can control it. It applies to our website (<strong>www.w3runn3rs.com</strong>) and our app (
        <strong>app.w3runn3rs.com</strong>), together the &ldquo;Service&rdquo;.
      </p>

      <h2>1. Who we are</h2>
      <p>
        W3Runn3rs (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a global hub for running clubs, based in Mexico City, Mexico. We
        are responsible for the personal data described in this policy. For anything related to your data, write to{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>2. Data we collect</h2>
      <h3>Your account</h3>
      <ul>
        <li>Name and email address.</li>
        <li>
          If you sign up with email and password, your password is stored only as a secure hash. If you sign in with
          Google, Google shares your name, email address and profile photo with us.
        </li>
      </ul>

      <h3>Your profile</h3>
      <ul>
        <li>Username, profile photo, banner image and bio.</li>
        <li>Links to your social profiles (X, Instagram, Facebook, Strava), if you add them.</li>
        <li>Preferred unit (km or miles), language and time zone.</li>
        <li>The runners you follow and who follows you.</li>
      </ul>

      <h3>Your club</h3>
      <ul>
        <li>The club you belong to, the date you joined and your role in it (member, collaborator or owner).</li>
        <li>Requests to join a club, and the details of any club you ask us to add (name, city, country, contact email, website, logo).</li>
      </ul>

      <h3>Runs from your connected device (Garmin, Polar)</h3>
      <p>
        Only if you connect your account with a device provider, and only with your authorization in that provider. For
        each run we receive:
      </p>
      <ul>
        <li>Date, start time and time zone offset, distance, duration, pace and activity type (road, trail, treadmill, etc.).</li>
        <li>Device name and the provider&apos;s flags, such as whether the run was entered manually or uploaded from the web.</li>
        <li>When the provider sends them: elevation, average and maximum heart rate, cadence and calories.</li>
        <li>When the provider sends it: the run&apos;s start location (latitude and longitude).</li>
        <li>
          When the provider sends detailed samples (for example, GPS points recorded during the run), we use them only
          to build features of the Service, such as a simplified route shape. We never show your coordinates to other
          people.
        </li>
      </ul>
      <p>
        We keep the run summary as the provider sent it, so we can check and correct how each run was counted. We also
        store the access credentials needed to receive your runs, encrypted. Providers only send runs recorded after you
        connect; we don&apos;t receive your history.
      </p>

      <h3>Website forms</h3>
      <ul>
        <li>Waitlist: email address, name and, optionally, your club.</li>
        <li>Ambassador applications: name, email address, social media handles and country.</li>
      </ul>

      <h3>Usage data</h3>
      <ul>
        <li>
          We use <strong>Google Analytics 4</strong> on the website and the app to understand how the Service is used
          (pages visited, device type, approximate location by country or city, and events such as signing up).
        </li>
        <li>Our hosting provider keeps technical logs (such as IP address and browser) for security and troubleshooting.</li>
      </ul>

      <h2>3. How we use your data</h2>
      <ul>
        <li>To run the Service: your account, profile, club membership and dashboard.</li>
        <li>To add the kilometers of your runs to your club and to build club and global leaderboards.</li>
        <li>
          To keep leaderboards fair: we automatically exclude runs entered manually or uploaded from the web, runs from
          before you joined your club, duplicates of the same run, and runs with a pace no runner could hold.
        </li>
        <li>To show you your own stats and records.</li>
        <li>
          To send you emails about the Service: email verification, welcome, beta access, and updates about club
          requests and approvals.
        </li>
        <li>To protect the Service and its users, and to comply with the law.</li>
        <li>To improve the Service, using aggregated information.</li>
      </ul>
      <p>
        <strong>We don&apos;t sell your personal data, we don&apos;t show ads, and we don&apos;t use your activity data
        for advertising.</strong>
      </p>

      <h2>4. What other people can see</h2>
      <p>W3Runn3rs is built around clubs, so some information is public, including to people without an account:</p>
      <ul>
        <li>
          <strong>Your profile</strong> (app.w3runn3rs.com/u/your-username): name, username, photo, bio, social links,
          your club, follower counts, your monthly ranking and kilometers in your club, and your personal records.
        </li>
        <li>
          <strong>Your club&apos;s page</strong>: club members&apos; names and photos, and the runs that counted for the club
          this month (runner, distance and date), plus the club&apos;s leaderboard.
        </li>
        <li>
          <strong>Leaderboards</strong>: each club&apos;s total kilometers, runs and number of runners.
        </li>
      </ul>
      <p>
        Heart rate, cadence, calories, start location and GPS points are <strong>only for you</strong>: they are never
        shown to other people. When you use a share button, you choose what to post and where.
      </p>

      <h2>5. Garmin, Polar and other device providers</h2>
      <ul>
        <li>You connect a provider by signing in with it and accepting the permissions it shows you. You can change those permissions in the provider&apos;s app.</li>
        <li>
          You can disconnect at any time from your settings in W3Runn3rs or from the provider&apos;s app. When you
          disconnect, we delete your access credentials and stop receiving runs. Runs we already received stay in your
          account and keep counting for the club they counted for, unless you ask us to delete them (see section 8).
        </li>
        <li>We use data from these providers only to run the Service, never to sell it or for advertising.</li>
        <li>Each provider handles your data in its own service under its own privacy policy.</li>
      </ul>

      <h2>6. Who processes your data for us</h2>
      <p>We share personal data only with providers that help us run the Service, and only as needed:</p>
      <ul>
        <li><strong>Vercel</strong>: hosting, and storage of images you upload (photos, banners, logos).</li>
        <li><strong>Neon</strong>: our database.</li>
        <li><strong>Resend</strong>: sending emails.</li>
        <li><strong>Google</strong>: sign-in with Google, and Google Analytics.</li>
        <li><strong>Garmin and Polar</strong>: the sources of your runs, when you connect them.</li>
      </ul>
      <p>
        These providers may process data in the United States and other countries. We may also disclose information when
        the law requires it.
      </p>

      <h2>7. Cookies</h2>
      <ul>
        <li>
          <strong>Essential</strong>: your session (to keep you signed in), your language, whether you&apos;re already on
          the waitlist, and a club invite link you opened (30 days, so the right club is ready when you sign up).
        </li>
        <li>
          <strong>Analytics</strong>: Google Analytics cookies. You can opt out with{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            Google&apos;s opt-out browser add-on
          </a>
          .
        </li>
      </ul>

      <h2>8. How long we keep your data, and how to delete it</h2>
      <ul>
        <li>Account, profile, club and run data: while your account is active.</li>
        <li>Waitlist data: until you ask us to remove it.</li>
        <li>Technical logs: for a short period, for security and troubleshooting.</li>
      </ul>
      <p>
        To delete your account and your data, write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a> from the email
        address of your account. We delete your account, profile, runs and device credentials within 30 days, except
        information the law requires us to keep.
      </p>

      <h2>9. Your rights</h2>
      <p>
        You can access, correct or delete your personal data, and object to how we use it (in Mexico, your ARCO rights).
        If you are in the European Union or the United Kingdom, you can also ask for a copy of your data in a portable
        format, ask us to restrict how we use it, and complain to your data protection authority. To exercise any of
        these rights, write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We answer within 20 business days.
      </p>
      <p>You can withdraw your consent to receive runs at any time by disconnecting your device.</p>

      <h2>10. Security</h2>
      <p>
        We use encrypted connections (HTTPS), encrypt device access credentials and limit who can access personal data.
        No system is completely secure, but we work to protect your data and will notify you if a security incident
        affects it.
      </p>

      <h2>11. Minimum age</h2>
      <p>
        The Service is for people who are at least <strong>18 years old</strong>. We don&apos;t knowingly collect personal
        data from minors. If you believe a minor has created an account, write to us and we will delete it.
      </p>

      <h2>12. Changes to this policy</h2>
      <p>
        We may update this policy as the Service changes. We will post the new version on this page with its date, and
        we will let you know by email or in the app if the changes are significant.
      </p>
    </>
  )
}

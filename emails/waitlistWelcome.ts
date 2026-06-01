export function waitlistWelcomeHtml(name?: string | null): string {
  const greeting = name ? `Hey ${name}!` : "Hey runner!";

  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the w3runn3rs waitlist!</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img
                src="https://www.w3runn3rs.com/images/logoAzul.png"
                alt="w3runn3rs"
                width="160"
                style="height:auto;display:block;"
              />
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#111827;border:1px solid #1f2937;border-radius:16px;padding:40px 36px;">

              <!-- Emoji -->
              <p style="margin:0 0 16px;font-size:48px;text-align:center;">🎉</p>

              <!-- Headline -->
              <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#ffffff;text-align:center;line-height:1.2;">
                You're on the list!
              </h1>

              <!-- Body -->
              <p style="margin:0 0 8px;font-size:16px;color:#9ca3af;text-align:center;line-height:1.6;">
                ${greeting}
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#9ca3af;text-align:center;line-height:1.6;">
                We'll notify you as soon as w3runn3rs is ready to launch.<br/>
                In the meantime, follow us for updates and help us spread the word.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a
                      href="https://www.w3runn3rs.com"
                      style="display:inline-block;background-color:#a3e635;color:#0a0a0a;font-weight:800;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:999px;"
                    >
                      Visit w3runn3rs.com →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1f2937;margin:0 0 28px;" />

              <!-- Socials -->
              <p style="margin:0 0 16px;font-size:12px;font-weight:600;color:#6b7280;text-align:center;text-transform:uppercase;letter-spacing:0.1em;">
                Follow us
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://x.com/w3runn3rs" style="display:inline-block;margin:0 10px;color:#9ca3af;font-size:13px;text-decoration:none;">Twitter / X</a>
                    <a href="https://www.instagram.com/w3runn3rs" style="display:inline-block;margin:0 10px;color:#9ca3af;font-size:13px;text-decoration:none;">Instagram</a>
                    <a href="https://farcaster.xyz/w3runn3rs" style="display:inline-block;margin:0 10px;color:#9ca3af;font-size:13px;text-decoration:none;">Farcaster</a>
                    <a href="https://www.strava.com/clubs/runn3rs" style="display:inline-block;margin:0 10px;color:#9ca3af;font-size:13px;text-decoration:none;">Strava</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#4b5563;">
                © 2026 w3runn3rs. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:#4b5563;">
                <a href="https://www.w3runn3rs.com/en/privacy-policy" style="color:#6b7280;text-decoration:none;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="https://www.w3runn3rs.com/en/terms-of-service" style="color:#6b7280;text-decoration:none;">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export const waitlistWelcomeSubject = "You're on the w3runn3rs waitlist! 🎉";

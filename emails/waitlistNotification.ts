type NotificationData = {
  email: string;
  name?: string | null;
  clubId?: string | null;
};

export function waitlistNotificationHtml({ email, name, clubId }: NotificationData): string {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/Mexico_City",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New waitlist signup</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#a3e635;border-radius:12px 12px 0 0;padding:20px 28px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#0a0a0a;text-transform:uppercase;letter-spacing:0.08em;">
                w3runn3rs · New signup
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px;">

              <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#111827;">
                🏃 New waitlist signup
              </p>

              <!-- Data rows -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;width:30%;">Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;font-weight:600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;">Name</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">${name || "—"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;">Club ID</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">${clubId || "—"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;font-size:13px;color:#6b7280;">Time (CDMX)</td>
                  <td style="padding:10px 0;font-size:14px;color:#111827;">${now}</td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:20px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                w3runn3rs internal notification · <a href="https://www.w3runn3rs.com" style="color:#9ca3af;">w3runn3rs.com</a>
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

export function waitlistNotificationSubject(email: string): string {
  return `New waitlist signup: ${email}`;
}

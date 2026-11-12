import { escapeHtml } from "./escape";

export type SignupMethod = "google" | "email";

/** Internal notification to run@w3runn3rs.com for every new app account. */
export function appSignupNotificationHtml(data: {
  email: string;
  name?: string | null;
  method: SignupMethod;
}): string {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/Mexico_City",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const method = data.method === "google" ? "Google" : "Email + password (verified)";
  const row = (label: string, value: string, last = false) => `
                <tr>
                  <td style="padding:10px 0;${last ? "" : "border-bottom:1px solid #f3f4f6;"}font-size:13px;color:#6b7280;width:30%;">${label}</td>
                  <td style="padding:10px 0;${last ? "" : "border-bottom:1px solid #f3f4f6;"}font-size:14px;color:#111827;">${value}</td>
                </tr>`;

  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New app account</title></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr>
            <td style="background-color:#a3e635;border-radius:12px 12px 0 0;padding:20px 28px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#0a0a0a;text-transform:uppercase;letter-spacing:0.08em;">w3runn3rs · New app account</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px;">
              <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#111827;">🏃 New runner account</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${row("Email", `<strong>${escapeHtml(data.email)}</strong>`)}
                ${row("Name", data.name ? escapeHtml(data.name) : "—")}
                ${row("Method", method)}
                ${row("Time (CDMX)", now, true)}
              </table>
              <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">
                Added to the waitlist without beta access. Grant it with
                <code>UPDATE "WaitlistEntry" SET "betaAccess" = true WHERE email = '…';</code>
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

export function appSignupNotificationSubject(email: string): string {
  return `New app account: ${email.replace(/[\r\n]+/g, " ")}`;
}

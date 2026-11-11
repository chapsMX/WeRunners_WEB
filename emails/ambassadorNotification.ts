import { escapeHtml } from "./escape";

type AmbassadorData = {
  fullName: string;
  email: string;
  country: string;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  motivation: string;
};

function row(label: string, value: string, last = false): string {
  const border = last ? "" : "border-bottom:1px solid #f3f4f6;";
  return `
                <tr>
                  <td style="padding:10px 0;${border}font-size:13px;color:#6b7280;width:30%;vertical-align:top;">${label}</td>
                  <td style="padding:10px 0;${border}font-size:14px;color:#111827;">${value}</td>
                </tr>`;
}

function handle(network: "instagram" | "x" | "tiktok", value: string | null): string {
  if (!value) return "—";
  const safe = escapeHtml(value);
  const base =
    network === "instagram" ? "https://instagram.com/" : network === "x" ? "https://x.com/" : "https://www.tiktok.com/@";
  return `<a href="${base}${encodeURIComponent(value)}" style="color:#111827;">@${safe}</a>`;
}

/** Internal notification to run@w3runn3rs.com. All user input is escaped. */
export function ambassadorNotificationHtml(data: AmbassadorData): string {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/Mexico_City",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const motivation = escapeHtml(data.motivation).replace(/\n/g, "<br/>");

  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New ambassador application</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <tr>
            <td style="background-color:#a3e635;border-radius:12px 12px 0 0;padding:20px 28px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#0a0a0a;text-transform:uppercase;letter-spacing:0.08em;">
                w3runn3rs · Ambassador application
              </p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px;">

              <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#111827;">
                🏃 New ambassador application
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${row("Name", `<strong>${escapeHtml(data.fullName)}</strong>`)}
                ${row("Email", escapeHtml(data.email))}
                ${row("Country", escapeHtml(data.country))}
                ${row("Instagram", handle("instagram", data.instagram))}
                ${row("Twitter / X", handle("x", data.twitter))}
                ${row("TikTok", handle("tiktok", data.tiktok))}
                ${row("Time (CDMX)", now, true)}
              </table>

              <p style="margin:24px 0 8px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">
                Why they want to be an ambassador
              </p>
              <p style="margin:0;font-size:14px;color:#111827;line-height:1.6;">
                ${motivation}
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding-top:20px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                w3runn3rs internal notification · status: pending
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

export function ambassadorNotificationSubject(fullName: string): string {
  // Subjects are plain text; strip line breaks so input can't inject headers.
  return `New ambassador application: ${fullName.replace(/[\r\n]+/g, " ")}`;
}

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const fromSupportEmail =
  process.env.FROM_SUPPORT_EMAIL ||
  "Mahesh Kumar Nayak <support@maheshnayak.me>";

const myEmail = process.env.MY_EMAIL;

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function safeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendSupportRequestNotification({
  userId,
  name,
  email,
  phoneNumber,
  projectName,
  requestType,
  message,
  referenceUrl,
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  if (!myEmail || !safeEmail(myEmail)) {
    throw new Error("MY_EMAIL is missing or invalid.");
  }

  if (!userId || !name || !email || !message) {
    throw new Error("User ID, name, email and message are required.");
  }

  if (!safeEmail(email)) {
    throw new Error("Client email is invalid.");
  }

  const user = {
    userId: escapeHtml(userId),
    name: escapeHtml(name),
    email: escapeHtml(email),
    phoneNumber: escapeHtml(phoneNumber || "Not provided"),
    projectName: escapeHtml(projectName || "Not specified"),
    requestType: escapeHtml(requestType || "General enquiry"),
  };

  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  let reference = "Not provided";

  if (referenceUrl) {
    try {
      const url = new URL(referenceUrl);
      if (["https:", "http:"].includes(url.protocol)) {
        reference = `<a href="${escapeHtml(url.href)}"
          style="color:#2459d3;">View reference</a>`;
      }
    } catch {
      reference = "Invalid reference URL";
    }
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Support Request</title>
</head>
<body style="margin:0;padding:25px 12px;background:#f3f5f9;
font-family:Arial,Helvetica,sans-serif;color:#17243a;">

<table role="presentation" width="100%" cellspacing="0"
  cellpadding="0" style="max-width:600px;margin:auto;
  background:#ffffff;border-radius:12px;overflow:hidden;">

  <tr>
    <td style="background:#101b32;padding:30px;">
      <p style="color:#ffffff;font-size:18px;font-weight:bold;
        letter-spacing:1px;margin:0;">MAHESH NAYAK</p>
      <p style="color:#a8c7fa;font-size:11px;
        letter-spacing:2px;margin:8px 0 22px;">
        SUPPORT NOTIFICATION
      </p>
      <h1 style="color:#ffffff;font-size:27px;
        line-height:1.3;margin:0;">
        New support request received.
      </h1>
      <p style="color:#c8d5e8;font-size:14px;line-height:1.6;">
        A client has submitted a request that needs your attention.
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:28px;">

      <h2 style="font-size:17px;margin:0 0 17px;">
        Client information
      </h2>

      <table role="presentation" width="100%" cellspacing="0"
        cellpadding="0" style="background:#f3f6fa;border-radius:9px;">

        ${[
          ["User ID", user.userId],
          ["Name", user.name],
          ["Email", user.email],
          ["Phone number", user.phoneNumber],
        ]
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:12px 14px;
              border-bottom:1px solid #e5eaf0;">
              <p style="margin:0 0 5px;color:#78869a;
                font-size:10px;font-weight:bold;
                letter-spacing:1px;">${label.toUpperCase()}</p>
              <p style="margin:0;color:#17243a;
                font-size:14px;font-weight:600;">${value}</p>
            </td>
          </tr>
        `,
          )
          .join("")}

      </table>

      <h2 style="font-size:17px;margin:28px 0 16px;">
        Request details
      </h2>

      <p style="font-size:12px;color:#78869a;margin:0 0 5px;">
        PROJECT
      </p>
      <p style="font-size:14px;margin:0 0 17px;">
        ${user.projectName}
      </p>

      <p style="font-size:12px;color:#78869a;margin:0 0 5px;">
        REQUEST TYPE
      </p>
      <p style="font-size:14px;margin:0 0 17px;">
        ${user.requestType}
      </p>

      <p style="font-size:12px;color:#78869a;margin:0 0 8px;">
        CLIENT MESSAGE
      </p>

      <div style="padding:17px;background:#f3f6fa;
        border-radius:9px;font-size:14px;line-height:1.8;
        color:#34445b;">
        ${safeMessage}
      </div>

      <div style="margin-top:18px;font-size:13px;">
        <strong>Reference:</strong> ${reference}
      </div>

      <table role="presentation" width="100%" cellspacing="0"
        cellpadding="0">
        <tr>
          <td align="center" style="padding:28px 0 8px;">
            <a href="mailto:${user.email}"
              style="display:inline-block;background:#2459d3;
              color:#ffffff;text-decoration:none;
              padding:15px 28px;border-radius:7px;
              font-size:14px;font-weight:bold;">
              Reply to client &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="text-align:center;color:#8793a5;
        font-size:11px;margin:15px 0 0;">
        Automated notification from your website's support system.
      </p>

    </td>
  </tr>

  <tr>
    <td style="padding:20px;background:#f7f8fb;
      text-align:center;border-top:1px solid #e9edf3;">
      <p style="margin:0;font-size:13px;font-weight:bold;">
        Mahesh Kumar Nayak
      </p>
      <p style="margin:6px 0 0;font-size:11px;color:#8793a5;">
        Client Support · maheshnayak.me
      </p>
    </td>
  </tr>

</table>
</body>
</html>`;

  const text = `
NEW SUPPORT REQUEST

CLIENT INFORMATION
User ID: ${userId}
Name: ${name}
Email: ${email}
Phone: ${phoneNumber || "Not provided"}

REQUEST DETAILS
Project: ${projectName || "Not specified"}
Request type: ${requestType || "General enquiry"}

MESSAGE
${message}

Reference: ${referenceUrl || "Not provided"}

Reply to the client: ${email}
  `.trim();

  const { data, error } = await resend.emails.send({
    from: fromSupportEmail,
    to: [myEmail],
    replyTo: email,
    subject: `New support request from ${name}`,
    html,
    text,
  });

  if (error) {
    console.error("Support notification failed:", error);
    throw new Error(error.message || "Unable to send notification.");
  }

  return data;
}

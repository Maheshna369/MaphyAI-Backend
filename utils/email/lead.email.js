import { Resend } from "resend";

const fromEmail = process.env.FROM_EMAIL;
const myEmail = process.env.MY_EMAIL;
const myPhone = process.env.MY_PHONE;
const fiverrUrl = process.env.FIVERR_URL;
const whatsappUrl = process.env.WHATSAPP_URL;
const linkedinUrl = process.env.LINKEDIN_URL;
const portfolioUrl = process.env.PORTFOLIO_URL;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const adminNClientARLead = async ({
  name,
  email,
  phoneNumber,
  message,
  services,
}) => {
  try {
    // -----------------------------------
    // Environment validation
    // -----------------------------------

    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!fromEmail) {
      throw new Error("FROM_EMAIL is not configured");
    }

    if (!myEmail) {
      throw new Error("MY_EMAIL is not configured");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // -----------------------------------
    // Sanitize user-provided values
    // -----------------------------------

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phoneNumber || "Not provided");
    const safeMessage = escapeHtml(message);

    const safeServices = services?.length
      ? services.map((service) => escapeHtml(service))
      : [];

    // -----------------------------------
    // Services - Client
    // -----------------------------------

    const serviceListClient = safeServices.length
      ? safeServices
          .map(
            (service) => `
              <tr>
                <td style="
                  padding: 7px 0;
                  font-size: 14px;
                  color: #334155;
                  border-bottom: 1px solid #e2e8f0;
                ">
                  ${service}
                </td>
              </tr>
            `,
          )
          .join("")
      : `
          <tr>
            <td style="
              padding: 7px 0;
              font-size: 14px;
              color: #64748b;
            ">
              Not specified
            </td>
          </tr>
        `;

    // -----------------------------------
    // Services - Admin
    // -----------------------------------

    const serviceListAdmin = safeServices.length
      ? safeServices
          .map(
            (service) => `
              <span style="
                display: inline-block;
                margin: 4px 4px 4px 0;
                padding: 6px 10px;
                border-radius: 999px;
                background: #f1f5f9;
                color: #334155;
                font-size: 12px;
                font-weight: 600;
              ">
                ${service}
              </span>
            `,
          )
          .join("")
      : `
          <span style="
            color: #64748b;
            font-size: 13px;
          ">
            Not specified
          </span>
        `;

    // ========================================================
    // CLIENT EMAIL
    // ========================================================

    const clientHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>We received your request</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
          color: #0f172a;
        ">

          <div style="
            width: 100%;
            padding: 40px 16px;
            box-sizing: border-box;
          ">

            <div style="
              max-width: 620px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              overflow: hidden;
            ">

              <!-- Header -->
              <div style="
                padding: 28px 32px;
                border-bottom: 1px solid #e2e8f0;
              ">

                <div style="
                  font-size: 13px;
                  font-weight: 700;
                  color: #64748b;
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                ">
                  Mahesh • Web Development & AI Automation
                </div>

                <h1 style="
                  margin: 18px 0 8px;
                  font-size: 27px;
                  line-height: 1.25;
                  color: #0f172a;
                  font-weight: 700;
                ">
                  Thanks for reaching out, ${safeName}
                </h1>

                <p style="
                  margin: 0;
                  font-size: 15px;
                  line-height: 1.7;
                  color: #64748b;
                ">
                  Your request has been received successfully.
                  I'll review the details and get back to you shortly.
                </p>

              </div>

              <!-- Main -->
              <div style="padding: 28px 32px;">

                <!-- Request summary -->
                <div style="
                  padding: 18px;
                  background: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                ">

                  <p style="
                    margin: 0 0 14px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  ">
                    Request summary
                  </p>

                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                  >
                    ${serviceListClient}
                  </table>

                </div>

                <!-- Message -->
                <div style="margin-top: 24px;">

                  <p style="
                    margin: 0 0 10px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  ">
                    Your message
                  </p>

                  <div style="
                    padding: 16px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #334155;
                    white-space: pre-line;
                  ">
                    ${safeMessage}
                  </div>

                </div>

                <!-- What happens next -->
                <div style="margin-top: 28px;">

                  <p style="
                    margin: 0 0 12px;
                    font-size: 15px;
                    font-weight: 700;
                    color: #0f172a;
                  ">
                    What happens next
                  </p>

                  <table
                    role="presentation"
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                  >

                    <tr>
                      <td style="
                        padding: 8px 0;
                        vertical-align: top;
                        width: 28px;
                        color: #0f172a;
                        font-weight: 700;
                      ">
                        01
                      </td>

                      <td style="
                        padding: 8px 0;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #475569;
                      ">
                        I'll review your requirements and understand
                        the scope of the project.
                      </td>
                    </tr>

                    <tr>
                      <td style="
                        padding: 8px 0;
                        vertical-align: top;
                        width: 28px;
                        color: #0f172a;
                        font-weight: 700;
                      ">
                        02
                      </td>

                      <td style="
                        padding: 8px 0;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #475569;
                      ">
                        I'll suggest a suitable approach, timeline,
                        and next steps.
                      </td>
                    </tr>

                    <tr>
                      <td style="
                        padding: 8px 0;
                        vertical-align: top;
                        width: 28px;
                        color: #0f172a;
                        font-weight: 700;
                      ">
                        03
                      </td>

                      <td style="
                        padding: 8px 0;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #475569;
                      ">
                        I'll get back to you with the details for
                        moving forward.
                      </td>
                    </tr>

                  </table>

                </div>

                <!-- Contact -->
                <div style="
                  margin-top: 30px;
                  padding: 22px;
                  background: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                ">

                  <p style="
                    margin: 0 0 14px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #334155;
                  ">
                    Let's connect
                  </p>

                  <p style="
                    margin: 0 0 16px;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #64748b;
                  ">
                    You can reach me directly through any of the
                    channels below.
                  </p>

                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    width="100%"
                  >

                    <tr>
                      <td style="
                        padding: 6px 0;
                        font-size: 14px;
                      ">
                        <strong style="color:#334155;">
                          Email
                        </strong>
                        <br />

                        <a
                          href="mailto:${myEmail}"
                          style="
                            color:#0f172a;
                            text-decoration:none;
                          "
                        >
                          ${myEmail}
                        </a>
                      </td>
                    </tr>

                    <tr>
                      <td style="
                        padding: 6px 0;
                        font-size: 14px;
                      ">
                        <strong style="color:#334155;">
                          Phone
                        </strong>
                        <br />

                        <a
                          href="tel:${myPhone || ""}"
                          style="
                            color:#0f172a;
                            text-decoration:none;
                          "
                        >
                          ${myPhone || "Not provided"}
                        </a>
                      </td>
                    </tr>

                    <tr>
                      <td style="
                        padding: 6px 0;
                        font-size: 14px;
                      ">
                        <strong style="color:#334155;">
                          WhatsApp
                        </strong>
                        <br />

                        <a
                          href="${whatsappUrl}"
                          style="
                            color:#0f172a;
                            text-decoration:none;
                          "
                        >
                          Chat on WhatsApp
                        </a>
                      </td>
                    </tr>

                    <tr>
                      <td style="
                        padding: 6px 0;
                        font-size: 14px;
                      ">
                        <strong style="color:#334155;">
                          Fiverr
                        </strong>
                        <br />

                        <a
                          href="${fiverrUrl}"
                          style="
                            color:#0f172a;
                            text-decoration:none;
                          "
                        >
                          View my Fiverr profile
                        </a>
                      </td>
                    </tr>

                    <tr>
                      <td style="
                        padding: 6px 0;
                        font-size: 14px;
                      ">
                        <strong style="color:#334155;">
                          Portfolio
                        </strong>
                        <br />

                        <a
                          href="${portfolioUrl}"
                          style="
                            color:#0f172a;
                            text-decoration:none;
                          "
                        >
                          View my work
                        </a>
                      </td>
                    </tr>

                    <tr>
                      <td style="
                        padding: 6px 0;
                        font-size: 14px;
                      ">
                        <strong style="color:#334155;">
                          LinkedIn
                        </strong>
                        <br />

                        <a
                          href="${linkedinUrl}"
                          style="
                            color:#0f172a;
                            text-decoration:none;
                          "
                        >
                          Connect on LinkedIn
                        </a>
                      </td>
                    </tr>

                  </table>

                </div>

              </div>

              <!-- Footer -->
              <div style="
                padding: 24px 32px;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
              ">

                <p style="
                  margin: 0;
                  font-size: 14px;
                  color: #334155;
                  font-weight: 700;
                ">
                  Mahesh
                </p>

                <p style="
                  margin: 4px 0 0;
                  font-size: 12px;
                  color: #94a3b8;
                ">
                  Web Development & AI Automation
                </p>

                <p style="
                  margin: 12px 0 0;
                  font-size: 12px;
                  color: #94a3b8;
                  line-height: 1.6;
                ">
                  ${myEmail}<br />
                  ${myPhone || ""}
                </p>

                <p style="
                  margin: 14px 0 0;
                  font-size: 11px;
                  color: #cbd5e1;
                ">
                  This email was sent in response to your project inquiry.
                </p>

              </div>

            </div>

          </div>

        </body>
      </html>
    `;

    // ========================================================
    // ADMIN EMAIL
    // ========================================================

    const adminHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>New Lead Captured</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background: #f1f5f9;
          font-family: Arial, Helvetica, sans-serif;
          color: #0f172a;
        ">

          <div style="
            width: 100%;
            padding: 32px 16px;
            box-sizing: border-box;
          ">

            <div style="
              max-width: 680px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              overflow: hidden;
            ">

              <!-- Header -->
              <div style="
                padding: 26px 30px;
                background: #0f172a;
              ">

                <div style="
                  font-size: 11px;
                  font-weight: 700;
                  letter-spacing: 0.1em;
                  text-transform: uppercase;
                  color: #94a3b8;
                ">
                  Lead Management
                </div>

                <h1 style="
                  margin: 10px 0 6px;
                  font-size: 25px;
                  line-height: 1.25;
                  color: #ffffff;
                ">
                  New lead captured
                </h1>

                <p style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #cbd5e1;
                ">
                  A new project inquiry has been submitted through
                  your website.
                </p>

              </div>

              <!-- Lead details -->
              <div style="padding: 28px 30px;">

                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                >

                  <tr>
                    <td style="
                      padding: 0 0 18px;
                      width: 140px;
                      vertical-align: top;
                      font-size: 12px;
                      font-weight: 700;
                      color: #94a3b8;
                      text-transform: uppercase;
                      letter-spacing: 0.05em;
                    ">
                      Name
                    </td>

                    <td style="
                      padding: 0 0 18px;
                      font-size: 14px;
                      color: #0f172a;
                      font-weight: 600;
                    ">
                      ${safeName}
                    </td>
                  </tr>

                  <tr>
                    <td style="
                      padding: 0 0 18px;
                      vertical-align: top;
                      font-size: 12px;
                      font-weight: 700;
                      color: #94a3b8;
                      text-transform: uppercase;
                      letter-spacing: 0.05em;
                    ">
                      Email
                    </td>

                    <td style="
                      padding: 0 0 18px;
                      font-size: 14px;
                      color: #334155;
                    ">
                      <a
                        href="mailto:${safeEmail}"
                        style="
                          color: #0f172a;
                          text-decoration: underline;
                        "
                      >
                        ${safeEmail}
                      </a>
                    </td>
                  </tr>

                  <tr>
                    <td style="
                      padding: 0 0 18px;
                      vertical-align: top;
                      font-size: 12px;
                      font-weight: 700;
                      color: #94a3b8;
                      text-transform: uppercase;
                      letter-spacing: 0.05em;
                    ">
                      Phone
                    </td>

                    <td style="
                      padding: 0 0 18px;
                      font-size: 14px;
                      color: #334155;
                    ">
                      ${safePhone}
                    </td>
                  </tr>

                </table>

                <!-- Services -->
                <div style="
                  padding: 20px;
                  margin-top: 6px;
                  background: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                ">

                  <p style="
                    margin: 0 0 12px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  ">
                    Services requested
                  </p>

                  <div>
                    ${serviceListAdmin}
                  </div>

                </div>

                <!-- Message -->
                <div style="margin-top: 24px;">

                  <p style="
                    margin: 0 0 10px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  ">
                    Project message
                  </p>

                  <div style="
                    padding: 16px;
                    border-left: 3px solid #0f172a;
                    background: #f8fafc;
                    border-radius: 0 10px 10px 0;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #334155;
                    white-space: pre-line;
                  ">
                    ${safeMessage}
                  </div>

                </div>

                <!-- Status -->
                <div style="
                  display: inline-block;
                  margin-top: 24px;
                  padding: 7px 11px;
                  border-radius: 999px;
                  background: #ecfdf5;
                  color: #047857;
                  font-size: 12px;
                  font-weight: 700;
                ">
                  ● New Lead
                </div>

              </div>

              <!-- Footer -->
              <div style="
                padding: 20px 30px;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
              ">

                <p style="
                  margin: 0;
                  font-size: 12px;
                  color: #94a3b8;
                ">
                  Source: Website
                </p>

              </div>

            </div>

          </div>

        </body>
      </html>
    `;

    // ========================================================
    // SEND BOTH EMAILS
    // ========================================================

    const [clientResponse, adminResponse] = await Promise.all([
      resend.emails.send({
        from: fromEmail,
        to: email,
        replyTo: myEmail,
        subject: "We received your request",
        html: clientHtml,
      }),

      resend.emails.send({
        from: fromEmail,
        to: myEmail,
        replyTo: email,
        subject: `New Lead: ${name}`,
        html: adminHtml,
      }),
    ]);

    return {
      success: true,
      adminResponse,
      clientResponse,
    };
  } catch (err) {
    console.error("Error while sending lead emails:", err);

    return {
      success: false,
      error: "Failed to send emails",
    };
  }
};

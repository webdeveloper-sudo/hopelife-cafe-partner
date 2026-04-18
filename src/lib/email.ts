import nodemailer from "nodemailer";

// ---- Transporter ----
let transporter: nodemailer.Transporter | null = null;
let smtpVerified = false;

const getTransporter = async (): Promise<nodemailer.Transporter | null> => {
    if (transporter && smtpVerified) return transporter;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        console.warn("[Email] SMTP credentials missing — emails will be logged only.");
        return null;
    }

    try {
        transporter = nodemailer.createTransport({
            host,
            port: parseInt(process.env.SMTP_PORT || "465"),
            secure: process.env.SMTP_SECURE === "true" || parseInt(process.env.SMTP_PORT || "465") === 465,
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
        });
        await transporter.verify();
        smtpVerified = true;
        console.log("[Email] SMTP transporter verified ✅");
    } catch (err: any) {
        console.warn("[Email] SMTP verification failed:", err.message);
        transporter = null;
        smtpVerified = false;
    }
    return transporter;
};

async function sendMail(options: nodemailer.SendMailOptions): Promise<boolean> {
    const t = await getTransporter();
    if (!t) {
        console.log(`[Email LOG] To: ${options.to} | Subject: ${options.subject}`);
        return true; // allow flow to continue in dev
    }
    try {
        await t.sendMail(options);
        console.log(`[Email] Sent to ${options.to}`);
        return true;
    } catch (err: any) {
        console.error("[Email] Send failed:", err.message);
        return false;
    }
}

// ---- Email Templates ----

export async function sendPartnerOTPEmail(email: string, otp: string): Promise<boolean> {
    const subject = "Your OTP — HOPE Cafe Partner Program";
    const html = `
    <div style="font-family:'Poppins','Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#1a6b3a,#2d9651);padding:40px 32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px">HOPE Cafe</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase">Partner Program</p>
      </div>
      <div style="padding:48px 40px;text-align:center">
        <h2 style="color:#1a1a1a;font-size:22px;font-weight:700;margin:0 0 16px">Verify Your Email</h2>
        <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 32px">Use the code below to complete your partner registration. This code is valid for <strong>10 minutes</strong>.</p>
        <div style="background:#f0fdf4;border:2px solid #1a6b3a;border-radius:12px;padding:24px 40px;display:inline-block;margin:0 auto">
          <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#1a6b3a;font-family:'Courier New',monospace">${otp}</div>
        </div>
        <p style="color:#999;font-size:13px;margin:32px 0 0">If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #f0f0f0">
        <p style="color:#bbb;font-size:12px;margin:0">© ${new Date().getFullYear()} HOPE Cafe — Achariya Campus, Pondicherry</p>
      </div>
    </div>`;

    return sendMail({
        from: process.env.SMTP_FROM || `"HOPE Cafe" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
    });
}

export async function sendPartnerApprovalEmail(
    email: string,
    partnerName: string,
    contactName: string,
    setPasswordUrl: string
): Promise<boolean> {
    const subject = "🎉 Welcome to HOPE Cafe Partner Program — Set Your Password";
    const html = `
    <div style="font-family:'Poppins','Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#1a6b3a,#2d9651);padding:40px 32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800">HOPE Cafe</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase">Partner Program</p>
      </div>
      <div style="padding:48px 40px">
        <h2 style="color:#1a1a1a;font-size:24px;font-weight:700;margin:0 0 12px">Congratulations, ${contactName}! 🎉</h2>
        <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px">
          Your application for <strong>${partnerName}</strong> has been <span style="color:#1a6b3a;font-weight:700">approved</span>! Welcome to the HOPE Cafe Partner Network.
        </p>
        <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 32px">
          To get started, please set your account password using the button below. This link is valid for <strong>48 hours</strong>.
        </p>
        <div style="text-align:center;margin:0 0 32px">
          <a href="${setPasswordUrl}" style="background:linear-gradient(135deg,#1a6b3a,#2d9651);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;display:inline-block;letter-spacing:0.3px">
            Set My Password →
          </a>
        </div>
        <div style="background:#f0fdf4;border-radius:12px;padding:20px 24px;border-left:4px solid #1a6b3a">
          <p style="color:#1a6b3a;font-weight:700;margin:0 0 8px;font-size:14px">What's next?</p>
          <ul style="color:#555;font-size:14px;line-height:1.8;margin:0;padding-left:20px">
            <li>Set your password using the link above</li>
            <li>Login at <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="color:#1a6b3a">${process.env.NEXT_PUBLIC_APP_URL}/login</a></li>
            <li>Start referring guests and earning commissions!</li>
          </ul>
        </div>
      </div>
      <div style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #f0f0f0">
        <p style="color:#bbb;font-size:12px;margin:0">© ${new Date().getFullYear()} HOPE Cafe — Achariya Campus, Pondicherry</p>
        <p style="color:#ccc;font-size:11px;margin:6px 0 0">If you didn't apply to become a partner, please ignore this email.</p>
      </div>
    </div>`;

    return sendMail({
        from: process.env.SMTP_FROM || `"HOPE Cafe" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
    });
}

export async function sendPartnerRejectionEmail(
    email: string,
    partnerName: string,
    reason: string
): Promise<boolean> {
    const subject = "Update regarding your HOPE Cafe Partner Application";
    const html = `
    <div style="font-family:'Poppins','Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      <div style="background:#f9fafb;padding:40px 32px;text-align:center;border-bottom:1px solid #f0f0f0">
        <h1 style="color:#1a1a1a;margin:0;font-size:24px;font-weight:800">HOPE Cafe</h1>
      </div>
      <div style="padding:48px 40px">
        <h2 style="color:#1a1a1a;font-size:20px;font-weight:700;margin:0 0 16px">Hello,</h2>
        <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 24px">
          Thank you for your interest in the HOPE Cafe Partner Program. After reviewing the application for <strong>${partnerName}</strong>, we are unable to approve your account at this time.
        </p>
        <div style="background:#fff5f5;border-radius:12px;padding:24px;border-left:4px solid #f87171;margin-bottom:32px">
          <p style="color:#991b1b;font-weight:700;margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px">Reason for Rejection:</p>
          <p style="color:#7f1d1d;font-size:15px;line-height:1.6;margin:0">${reason}</p>
        </div>
        <p style="color:#666;font-size:14px;line-height:1.6;margin:0">
          If you have any questions or would like to provide additional information for a future review, please reply to this email.
        </p>
      </div>
      <div style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #f0f0f0">
        <p style="color:#bbb;font-size:12px;margin:0">© ${new Date().getFullYear()} HOPE Cafe — Achariya Campus, Pondicherry</p>
      </div>
    </div>`;

    return sendMail({
        from: process.env.SMTP_FROM || `"HOPE Cafe Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
    });
}

export async function sendAdminNewPartnerAlert(
    partnerName: string,
    contactName: string,
    email: string,
    mobile: string,
    businessType: string
): Promise<void> {
    const adminEmail = process.env.SMTP_USER;
    if (!adminEmail) return;

    await sendMail({
        from: process.env.SMTP_FROM || `"HOPE Cafe System" <${adminEmail}>`,
        to: adminEmail,
        subject: `[HOPE Cafe] New Partner Application — ${partnerName}`,
        html: `
        <div style="font-family:'Poppins',Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px">
          <h2 style="color:#1a6b3a;margin:0 0 20px">New Partner Application</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666;font-size:14px">Business</td><td style="padding:8px 0;font-weight:700;font-size:14px">${partnerName}</td></tr>
            <tr><td style="padding:8px 0;color:#666;font-size:14px">Contact</td><td style="padding:8px 0;font-weight:700;font-size:14px">${contactName}</td></tr>
            <tr><td style="padding:8px 0;color:#666;font-size:14px">Email</td><td style="padding:8px 0;font-weight:700;font-size:14px">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#666;font-size:14px">Mobile</td><td style="padding:8px 0;font-weight:700;font-size:14px">${mobile}</td></tr>
            <tr><td style="padding:8px 0;color:#666;font-size:14px">Type</td><td style="padding:8px 0;font-weight:700;font-size:14px">${businessType}</td></tr>
          </table>
          <div style="margin-top:24px;text-align:center">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/partners" style="background:#1a6b3a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Review in Admin Panel →</a>
          </div>
        </div>`,
    });
}

import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

const allowedEmails = (process.env.AUTH_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ?? "Convex Chatbot Kit";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };

    const alphabet = "0123456789";
    const length = 8;
    return generateRandomString(random, alphabet, length);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const normalizedEmail = email.trim().toLowerCase();
    if (allowedEmails.length > 0 && !allowedEmails.includes(normalizedEmail)) {
      throw new Error(
        "This email is not on the allowed list. Contact the administrator for access."
      );
    }

    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: `${APP_NAME} <onboarding@yeahscene.com>`,
      to: [email],
      subject: `Your sign-in code: ${token}`,
      html: `
        <div style="background:#0a0a0a;padding:32px 12px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
          <div style="max-width:480px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:32px;">
            <div style="color:#ededed;font-size:18px;font-weight:600;line-height:1.4;margin:0 0 20px 0;">
              ${APP_NAME}
            </div>

            <div style="color:#a1a1a1;font-size:14px;line-height:1.6;margin:0 0 8px 0;">
              Sign-in request for <strong style="color:#ededed;">${email}</strong>
            </div>
            <div style="color:#a1a1a1;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
              Enter this code in the sign-in window. It expires in 15 minutes.
            </div>

            <div style="text-align:center;margin:0 0 24px 0;">
              <div style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:16px 28px;">
                <span style="color:#f5f5f5;font-size:28px;letter-spacing:10px;font-weight:700;">${token}</span>
              </div>
            </div>

            <div style="color:#666;font-size:12px;line-height:1.6;">
              If you did not request this, you can safely ignore this email. Never share this code.
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});

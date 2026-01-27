import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    console.log("Sending password reset email to:", email);
    console.log("Reset URL:", resetUrl);

    // Validate required fields
    if (!email || !resetUrl) {
      throw new Error("Missing required fields: email and resetUrl are required");
    }

    const emailResponse = await resend.emails.send({
      from: "LeadSquad <noreply@leadsquad.ai>",
      to: [email],
      subject: "Reset Your LeadSquad Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0b;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px;">
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                        Lead<span style="color: #00f2a2;">Squad</span>
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Card -->
                  <tr>
                    <td style="background-color: #18181b; border-radius: 12px; padding: 40px 32px; border: 1px solid #27272a;">
                      <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                        Reset Your Password
                      </h2>
                      <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #a1a1aa;">
                        We received a request to reset the password for your LeadSquad account. Click the button below to set a new password.
                      </p>
                      
                      <!-- Button -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 8px 0 24px 0;">
                            <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #00f2a2; color: #0a0a0b; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 20px; color: #71717a;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                      </p>
                      
                      <p style="margin: 0; font-size: 14px; line-height: 20px; color: #71717a;">
                        This link will expire in 1 hour.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding-top: 32px;">
                      <p style="margin: 0; font-size: 12px; color: #52525b;">
                        © ${new Date().getFullYear()} LeadSquad. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

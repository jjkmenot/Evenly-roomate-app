
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  invitedBy: string;
  roommateEmail: string;
  roommateName: string;
  isNewUser: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitedBy, roommateEmail, roommateName, isNewUser }: InvitationRequest = await req.json();
    
    const appUrl = req.headers.get("origin") || "http://localhost:3000";
    
    let subject: string;
    let htmlContent: string;
    
    if (isNewUser) {
      subject = `${invitedBy} invited you to join their roommate group!`;
      htmlContent = `
        <h1>You've been invited to join a roommate group!</h1>
        <p>Hi ${roommateName},</p>
        <p>${invitedBy} has invited you to join their roommate group to manage bills, chores, and shopping lists together.</p>
        <p>To get started, please click the link below to create your account:</p>
        <p><a href="${appUrl}/auth" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Join Roommate Group</a></p>
        <p>Once you create your account with this email address, you'll automatically be added to the group!</p>
        <p>Best regards,<br>The Roommate App Team</p>
      `;
    } else {
      subject = `${invitedBy} added you to their roommate group!`;
      htmlContent = `
        <h1>You've been added to a roommate group!</h1>
        <p>Hi ${roommateName},</p>
        <p>${invitedBy} has added you to their roommate group. You can now manage bills, chores, and shopping lists together.</p>
        <p>Log in to see your new roommate group:</p>
        <p><a href="${appUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Roommate Group</a></p>
        <p>Best regards,<br>The Roommate App Team</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Roommate App <onboarding@resend.dev>",
      to: [roommateEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

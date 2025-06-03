
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnnouncementEmailRequest {
  title: string;
  content: string;
  groupId?: string;
  createdBy: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { title, content, groupId, createdBy }: AnnouncementEmailRequest = await req.json();

    // Get roommates to notify based on group
    let query = supabaseClient
      .from('roommates')
      .select('email, name');

    if (groupId && groupId !== 'all') {
      query = query.eq('group_id', groupId);
    }

    const { data: roommates, error: roommatesError } = await query;

    if (roommatesError) {
      throw new Error(`Failed to fetch roommates: ${roommatesError.message}`);
    }

    if (!roommates || roommates.length === 0) {
      return new Response(
        JSON.stringify({ message: "No roommates to notify" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get group name if applicable
    let groupName = "All Roommates";
    if (groupId && groupId !== 'all') {
      const { data: group } = await supabaseClient
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single();
      
      if (group) {
        groupName = group.name;
      }
    }

    // Send emails to all roommates
    const emailPromises = roommates.map(async (roommate) => {
      try {
        return await resend.emails.send({
          from: "RoomieApp <onboarding@resend.dev>",
          to: [roommate.email],
          subject: `📢 New Announcement: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f97316; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">📢 New Announcement</h1>
              </div>
              
              <div style="background-color: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e;">
                    <strong>Group:</strong> ${groupName}
                  </p>
                </div>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <p style="color: #374151; line-height: 1.6; margin: 0;">${content}</p>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    This announcement was posted by <strong>${createdBy}</strong>
                  </p>
                  <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                    You received this email because you're part of the ${groupName} group in RoomieApp.
                  </p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (error) {
        console.error(`Failed to send email to ${roommate.email}:`, error);
        return { error: error.message, email: roommate.email };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Announcement emails sent: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        message: `Announcement emails sent: ${successful} successful, ${failed} failed`,
        successful,
        failed
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-announcement-email function:", error);
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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

serve(async (req) => {
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      logStep("Webhook signature verified");
    } else {
      // In test mode without webhook secret, parse directly
      event = JSON.parse(body) as Stripe.Event;
      logStep("Webhook parsed without signature verification (test mode)");
    }

    logStep("Event received", { type: event.type, id: event.id });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { customerId: session.customer, subscriptionId: session.subscription });

        const customerEmail = session.customer_details?.email || session.customer_email;
        if (!customerEmail) {
          logStep("ERROR: No customer email found in session");
          break;
        }

        // Find user by email
        const { data: users, error: userErr } = await supabaseAdmin.auth.admin.listUsers();
        if (userErr) throw userErr;
        const user = users.users.find((u) => u.email === customerEmail);
        if (!user) {
          logStep("ERROR: No user found for email", { email: customerEmail });
          break;
        }

        // Get subscription details from Stripe
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id || null;
        const periodEnd = typeof subscription.current_period_end === "number"
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        // Upsert subscription record
        const { error: upsertErr } = await supabaseAdmin
          .from("subscriptions")
          .upsert(
            {
              user_id: user.id,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
              status: "active",
              price_id: priceId,
              current_period_end: periodEnd,
            },
            { onConflict: "user_id" }
          );

        if (upsertErr) {
          logStep("ERROR upserting subscription", { error: upsertErr.message });
        } else {
          logStep("Subscription record saved", { userId: user.id, status: "active" });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logStep("Payment failed", { customerId, invoiceId: invoice.id });

        const { error: updateErr } = await supabaseAdmin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", customerId);

        if (updateErr) {
          logStep("ERROR updating subscription to past_due", { error: updateErr.message });
        } else {
          logStep("Subscription marked as past_due");
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const newStatus = subscription.cancel_at_period_end ? "canceling" : subscription.status === "active" ? "active" : subscription.status;
        const periodEnd = typeof subscription.current_period_end === "number"
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;
        logStep("Subscription updated", { customerId, status: newStatus, cancelAtPeriodEnd: subscription.cancel_at_period_end });

        const { error: updateErr2 } = await supabaseAdmin
          .from("subscriptions")
          .update({ status: newStatus, current_period_end: periodEnd })
          .eq("stripe_customer_id", customerId);

        if (updateErr2) {
          logStep("ERROR updating subscription", { error: updateErr2.message });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        logStep("Subscription deleted", { customerId, subscriptionId: subscription.id });

        const { error: updateErr } = await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_customer_id", customerId);

        if (updateErr) {
          logStep("ERROR updating subscription to canceled", { error: updateErr.message });
        } else {
          logStep("Subscription marked as canceled");
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});

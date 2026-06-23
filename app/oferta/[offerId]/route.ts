import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function GET(_request: Request, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const supabase = getSupabaseServiceClient();

  if (!supabase) return NextResponse.redirect(new URL("/", _request.url));

  const { data: offer } = await supabase.from("phone_prices").select("id,phone_id,store,url").eq("id", offerId).maybeSingle();

  if (!offer?.url) return NextResponse.redirect(new URL("/", _request.url));

  const headerList = await headers();
  await supabase.from("affiliate_clicks").insert({
    phone_id: offer.phone_id,
    offer_id: offer.id,
    store: offer.store,
    target_url: offer.url,
    referrer: headerList.get("referer") ?? "",
    user_agent: headerList.get("user-agent") ?? ""
  });

  return NextResponse.redirect(offer.url);
}

"use server";

// TODO: Replace with Node.js backend API calls

export async function exportCoupons() {
  const supabase = createServerActionClient();

  const { data, error } = await supabase.from("coupons").select("*");

  if (error) {
    console.error(`Error fetching coupons:`, error);
    return { error: `Failed to fetch data for coupons.` };
  }

  return { data };
}

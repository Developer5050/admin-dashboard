"use server";

// TODO: Replace with Node.js backend API calls

export async function exportCategories() {
  const supabase = createServerActionClient();

  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    console.error(`Error fetching categories:`, error);
    return { error: `Failed to fetch data for categories.` };
  }

  return { data };
}

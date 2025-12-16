export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) return "";
  
  // If it's already a base64 data URL or full URL, return as is
  if (
    imagePath.startsWith("data:") ||
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads/, convert to full URL
  if (imagePath.startsWith("/uploads/")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${apiUrl}${imagePath}`;
  }
  
  // Return as is if it doesn't match any pattern
  return imagePath;
}


// Import all cake images
import weddingCake from "@/assets/wedding-cake.jpg";
import rainbowCake from "@/assets/rainbow-cake.jpg";
import chocolateCake from "@/assets/chocolate-cake.jpg";
import heroCake from "@/assets/hero-cake.jpg";

// Map database paths to imported images
const imageMap: Record<string, string> = {
  "/src/assets/wedding-cake.jpg": weddingCake,
  "/src/assets/rainbow-cake.jpg": rainbowCake,
  "/src/assets/chocolate-cake.jpg": chocolateCake,
  "/src/assets/hero-cake.jpg": heroCake,
};

// Fallback images
const fallbackImages = [heroCake, weddingCake, rainbowCake, chocolateCake];

export const resolveImageUrl = (dbPath: string | null, fallbackIndex: number = 0): string => {
  // If no path provided, use fallback
  if (!dbPath) {
    return fallbackImages[fallbackIndex % fallbackImages.length];
  }

  // If it's an external URL (starts with http/https), use it directly
  if (dbPath.startsWith('http://') || dbPath.startsWith('https://')) {
    return dbPath;
  }

  // Map internal paths to imported images
  const mappedImage = imageMap[dbPath];
  if (mappedImage) {
    return mappedImage;
  }

  // Fallback if path not found in map
  return fallbackImages[fallbackIndex % fallbackImages.length];
};

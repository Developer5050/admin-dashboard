"use client";

import { useState } from "react";
import Image from "next/image";

type ProductImageGalleryProps = {
  mainImage: string | null;
  images: string[] | null;
  productName: string;
};

export function ProductImageGallery({
  mainImage,
  images,
  productName,
}: ProductImageGalleryProps) {
  // Helper function to normalize image URLs for comparison
  const normalizeImageUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return '';
    // Remove query parameters and normalize
    const cleanUrl = url.split('?')[0].trim().toLowerCase();
    // Extract filename for comparison (in case full URLs differ but file is same)
    const filename = cleanUrl.split('/').pop() || cleanUrl;
    return filename;
  };

  // Helper function to check if two images are the same
  const areImagesSame = (img1: string, img2: string): boolean => {
    if (!img1 || !img2) return false;
    const normalized1 = normalizeImageUrl(img1);
    const normalized2 = normalizeImageUrl(img2);
    // Compare both normalized URLs and filenames
    return normalized1 === normalized2 || 
           img1.trim().toLowerCase() === img2.trim().toLowerCase();
  };

  // Process images: combine images array and mainImage prop
  // Filter out empty values
  let allImagesList: string[] = [];
  
  if (images && Array.isArray(images) && images.length > 0) {
    // Use images array - it contains all images (main + additional)
    allImagesList = images.filter((img) => img && typeof img === 'string' && img.trim() !== '');
  }
  
  // Add mainImage to the list if it's not already in the images array
  if (mainImage && typeof mainImage === 'string' && mainImage.trim() !== '') {
    const isMainImageInList = allImagesList.some((img) => areImagesSame(img, mainImage));
    if (!isMainImageInList) {
      // Add mainImage at the beginning if it's not in the array
      allImagesList = [mainImage, ...allImagesList];
    }
  } else if (allImagesList.length === 0 && mainImage) {
    // Fallback: if no images array but mainImage exists
    allImagesList = [mainImage];
  }
  
  // Remove duplicates (using areImagesSame for better comparison)
  const uniqueImages = allImagesList.filter((img, index, self) => {
    return index === self.findIndex((i) => areImagesSame(i, img));
  });
  
  // Determine main image: prioritize mainImage prop, otherwise use first image from array
  const displayMainImage = (mainImage && typeof mainImage === 'string' && mainImage.trim() !== '') 
    ? mainImage 
    : (uniqueImages.length > 0 ? uniqueImages[0] : null);
  
  // Additional images: filter out the main image from all images
  // This ensures main image doesn't appear in additional images even if it's in the array
  const additionalImages = uniqueImages.filter((img) => {
    if (!displayMainImage) return true;
    // Filter out any image that matches the main image
    return !areImagesSame(img, displayMainImage);
  });
  
  // Combine main image with additional images for easy swapping
  const allImages = displayMainImage ? [displayMainImage, ...additionalImages] : additionalImages;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Debug: Log images for troubleshooting (remove in production if needed)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('ProductImageGallery - Images:', {
      mainImage,
      images,
      uniqueImages,
      additionalImages: additionalImages.length,
      allImages: allImages.length
    });
  }

  const currentMainImage = allImages[selectedImageIndex];

  return (
    <div className="flex-shrink-0 w-full max-w-80 mx-auto md:mx-0 md:max-w-72 xl:max-w-80 xl:ml-3 2xl:ml-12">
      {/* Main Image */}
      {currentMainImage && currentMainImage.startsWith("data:image/") ? (
        <img
          src={currentMainImage}
          alt={productName || "Product image"}
          className="w-full max-w-[340px] sm:w-[340px] aspect-square object-cover rounded-3xl sm:ml-10 sm:mt-1 mx-auto"
        />
      ) : currentMainImage ? (
        <Image
          src={currentMainImage}
          alt={productName || "Product image"}
          width={340}
          height={340}
          priority
          className="w-full max-w-[340px] sm:w-[340px] aspect-square object-cover rounded-3xl sm:ml-10 sm:mt-1 mx-auto"
        />
      ) : (
        <div className="w-full max-w-[340px] sm:w-[340px] aspect-square bg-gray-200 rounded-3xl flex items-center justify-center sm:ml-10 sm:mt-1 mx-auto">
          <span className="text-muted-foreground">No Image</span>
        </div>
      )}

      {/* Image Gallery - Horizontal scrollable - Only additional images */}
      {additionalImages && additionalImages.length > 0 && (
        <div className="mt-4 w-full" style={{ minWidth: 0 }}>
          <div 
            className="flex gap-2 pb-2 overflow-x-auto overflow-y-hidden"
            style={{ 
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              width: "100%"
            }}
          >
            {additionalImages.map((img, index) => {
              // Calculate the actual index in allImages (main image is at index 0)
              const actualIndex = displayMainImage ? index + 1 : index;
              // Use image URL as key for better React reconciliation
              const imageKey = img || `additional-${index}`;
              return (
                <div
                  key={imageKey}
                  onClick={() => setSelectedImageIndex(actualIndex)}
                  className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === actualIndex
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-input hover:border-primary"
                  }`}
                  style={{ minWidth: "80px", minHeight: "80px" }}
                >
                  {img && img.startsWith("data:image/") ? (
                    <img
                      src={img}
                      alt={`${productName} - Image ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  ) : img ? (
                    <Image
                      src={img}
                      alt={`${productName} - Image ${index + 2}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


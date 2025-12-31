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
  const additionalImages = images && images.length > 0
    ? images.filter((img, index) => {
        // Skip first image (it's always the main image)
        if (index === 0) return false;
        
        // Additional safety: filter out any image that matches mainImage
        if (!img || img.trim() === '') return false;
        if (!mainImage) return true;
        
        // Normalize URLs for comparison (handle potential differences)
        const normalizedMain = mainImage.trim().toLowerCase();
        const normalizedImg = img.trim().toLowerCase();
        
        // Compare both full URLs and just the filename/path
        const mainPath = normalizedMain.split('/').pop() || normalizedMain;
        const imgPath = normalizedImg.split('/').pop() || normalizedImg;
        
        return normalizedImg !== normalizedMain && imgPath !== mainPath;
      })
    : [];
  
  // Combine main image with additional images for easy swapping
  const allImages = mainImage ? [mainImage, ...additionalImages] : additionalImages;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
          width={100}
          height={100}
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
        <div className="mt-4 overflow-x-auto">
          <div className="flex gap-2 pb-2" style={{ scrollbarWidth: "thin" }}>
            {additionalImages.map((img, index) => {
              // Calculate the actual index in allImages (main image is at index 0)
              const actualIndex = mainImage ? index + 1 : index;
              return (
                <div
                  key={index}
                  onClick={() => setSelectedImageIndex(actualIndex)}
                  className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === actualIndex
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-input hover:border-primary"
                  }`}
                >
                  {img && img.startsWith("data:image/") ? (
                    <img
                      src={img}
                      alt={`${productName} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : img ? (
                    <Image
                      src={img}
                      alt={`${productName} - Image ${index + 1}`}
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


import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Typography from "@/components/ui/typography";
import PageTitle from "@/components/shared/PageTitle";
import { ProductBadgeVariants } from "@/constants/badge";
import { EditProductSheet } from "./_components/EditProductSheet";

import { fetchProductDetails } from "@/services/products";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

type PageParams = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params: { slug },
}: PageParams): Promise<Metadata> {
  try {
    const { product } = await fetchProductDetails({
      id: slug, // Treat slug parameter as ID
    });

    return { title: product.name };
  } catch (e) {
    return { title: "Product not found" };
  }
}

export default async function ProductDetails({ params: { slug } }: PageParams) {
  try {
    if (!slug) {
      console.error("ProductDetails: No slug/ID provided");
      return notFound();
    }

    const { product } = await fetchProductDetails({
      id: slug, // Treat slug parameter as ID
    });

    return (
      <section className="space-y-6">
        <div className="flex items-center gap-4 mb-6 lg:mb-8 xl:ml-2.5 2xl:ml-6">
          <Link href="/products">
            <Button variant="outline" size="sm" className="">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <PageTitle className="mb-0">Product Details</PageTitle>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:mr-28 gap-6 lg:gap-0">
          {/* Product Image */}
          <div className="flex-shrink-0 w-full max-w-80 mx-auto md:mx-0 md:max-w-72 xl:max-w-80 xl:ml-3 2xl:ml-12">
            {product.image_url && product.image_url.startsWith('data:image/') ? (
              <img
                src={product.image_url}
                alt={product.name || "Product image"}
                className="w-full max-w-[340px] sm:w-[340px] aspect-square object-cover rounded-3xl sm:ml-10 sm:mt-1 mx-auto"
              />
            ) : product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name || "Product image"}
                width={200}
                height={200}
                priority
                className="w-full aspect-square object-cover rounded-3xl"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-200 rounded-3xl flex items-center justify-center">
                <Typography>No Image</Typography>
              </div>
            )}
          </div>

          {/* Product Information - Each line has heading and value side by side */}
          <div className="flex flex-col space-y-5 mt-4 sm:mt-0 ml-3 sm:ml-6 lg:-ml-10">
            <div className="flex items-center flex-nowrap gap-2 sm:gap-0">
              <Typography component="p" className="text-[14px] sm:text-[16px] font-semibold text-muted-foreground min-w-[100px] sm:min-w-[120px] flex-shrink-0">
                Product Title:
              </Typography>
              <Typography variant="h1" className="text-[14px] sm:text-[16px] md:text-[17px] font-normal flex-1 break-words">
                {product.name}
              </Typography>
            </div>

            {/* Second Line: Product Details heading and Details start */}
            <div className="flex items-start flex-nowrap gap-2 sm:gap-3">
              <Typography component="p" className="text-[14px] sm:text-[16px] font-semibold text-muted-foreground min-w-[100px] sm:min-w-[120px] flex-shrink-0">
                Product Details:
              </Typography>
              <Typography component="p" className="text-[12px] sm:text-[13px] text-foreground flex-1 break-words">
                {product.description || "No description available."}
              </Typography>
            </div>

            {/* Third Line: Status heading and Status value */}
            <div className="flex items-center flex-nowrap gap-2 sm:gap-3">
              <Typography component="p" className="text-[14px] sm:text-[16px] font-semibold text-muted-foreground min-w-[100px] sm:min-w-[120px] flex-shrink-0">
                Status:
              </Typography>
              <Badge
                variant={
                  ProductBadgeVariants[
                    product.stock > 0 ? "selling" : "out-of-stock"
                  ]
                }
                className="text-xs font-medium flex-shrink-0"
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            {/* Fourth Line: Sale Price heading and Sale Price value */}
            <div className="flex items-center flex-nowrap gap-2 sm:gap-3">
              <Typography component="p" className="text-[14px] sm:text-[16px] font-semibold text-muted-foreground min-w-[100px] sm:min-w-[120px] flex-shrink-0">
                Sale Price:
              </Typography>
              <Typography variant="h1" className="text-[14px] sm:text-[16px] md:text-[17px] font-normal text-black dark:text-white">
                ${product.selling_price.toFixed(2)}
              </Typography>
            </div>

            {/* Fifth Line: Quantity heading and Quantity value */}
            <div className="flex items-center flex-nowrap gap-2 sm:gap-3">
              <Typography component="p" className="text-[14px] sm:text-[16px] font-semibold text-muted-foreground min-w-[100px] sm:min-w-[120px] flex-shrink-0">
                Quantity:
              </Typography>
              <Typography component="p" className="text-[14px] sm:text-[16px]">
                {product.stock}
              </Typography>
            </div>

            {/* Sixth Line: Category heading and Category value */}
            <div className="flex items-center flex-nowrap gap-2 sm:gap-3">
              <Typography component="p" className="text-[14px] sm:text-[16px] font-semibold text-muted-foreground min-w-[100px] sm:min-w-[120px] flex-shrink-0">
                Category:
              </Typography>
              <Typography component="p" className="text-[14px] sm:text-[16px] break-words">
                {product.categories?.name || "—"}
              </Typography>
            </div>

            {/* Last Line: SKU heading and SKU value */}
            <div className="flex items-center flex-nowrap gap-2 sm:gap-3">
              <Typography component="p" className="text-[14px] sm:text-[16px] font-semibold text-muted-foreground min-w-[100px] sm:min-w-[120px] flex-shrink-0">
                SKU:
              </Typography>
              <Typography component="p" className="text-[14px] sm:text-[16px] font-mono break-all">
                {product.sku}
              </Typography>
            </div>

            {/* Edit Button */}
            <div className="pt-4">
              <EditProductSheet product={product}>
                <Button size="lg" className="max-w-40 w-full sm:w-auto ml-16 sm:-ml-0.5">
                  Edit Product
                </Button>
              </EditProductSheet>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (e: any) {
    console.error("ProductDetails: Error fetching product:", e);
    console.error("ProductDetails: Error message:", e?.message);
    console.error("ProductDetails: Product ID that failed:", slug);
    return notFound();
  }
}

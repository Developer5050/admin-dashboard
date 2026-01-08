const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");

// Add Product
const addProduct = async (req, res) => {
  try {
    const normalizedBody = {};
    for (const key in req.body) {
      const trimmedKey = key.trim();
      normalizedBody[trimmedKey] = req.body[key];
    }

    const {
      name,
      description,
      shortDescription,
      sku,
      category,
      costPrice,
      salesPrice,
      quantity,
      minStockThreshold,
      slug,
      status,
    } = normalizedBody;

    // Validate required fields
    if (!name || !description || !shortDescription || !sku || !category || !costPrice || !salesPrice || !quantity || !minStockThreshold) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        receivedFields: Object.keys(normalizedBody),
      });
    }

    // Validate shortDescription length
    if (shortDescription.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Short description must be 200 characters or less",
      });
    }

    // IMAGES CHECK
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    // Save file paths as array
    const productImages = req.files.map(file => `/uploads/products/${file.filename}`);

    // Generate slug if not provided (trim slug value if it exists)
    const slugValue = slug && typeof slug === 'string' ? slug.trim() : slug;
    const productSlug = slugValue && slugValue !== "" 
      ? slugify(slugValue, { lower: true, strict: true })
      : slugify(name.trim(), { lower: true, strict: true });

    // Parse and validate numbers (FormData sends everything as strings)
    const parsedCostPrice = parseFloat(costPrice);
    const parsedSalesPrice = parseFloat(salesPrice);
    const parsedQuantity = parseInt(quantity);
    const parsedMinStock = parseInt(minStockThreshold);

    // Validate numeric fields
    if (isNaN(parsedCostPrice) || isNaN(parsedSalesPrice) || isNaN(parsedQuantity) || isNaN(parsedMinStock)) {
      return res.status(400).json({
        success: false,
        message: "Cost price, sales price, quantity, and min stock threshold must be valid numbers",
      });
    }

    // Validate numeric values are non-negative
    if (parsedCostPrice < 0 || parsedSalesPrice < 0 || parsedQuantity < 0 || parsedMinStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Cost price, sales price, quantity, and min stock threshold cannot be negative",
      });
    }

    // Check if product with same SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with this SKU already exists",
      });
    }

    // Check if product with same slug already exists
    const existingSlug = await Product.findOne({ slug: productSlug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Product with this slug already exists",
      });
    }

    // Validate and set status (default to "draft" if not provided)
    const validStatuses = ["selling", "out of stock", "draft"];
    const productStatus = status && typeof status === 'string' 
      ? status.trim() 
      : "draft";
    
    if (!validStatuses.includes(productStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

      const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      images: productImages,
      image: productImages[0], // Also set image field for backward compatibility
      sku: sku.trim(),
      category: category.trim(),
      costPrice: parsedCostPrice,
      salesPrice: parsedSalesPrice,
      quantity: parsedQuantity,
      minStockThreshold: parsedMinStock,
      slug: productSlug,
      status: productStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Product Create Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
    try {
      // Extract query parameters
      const {
        page = 1,
        limit = 10,
        search,
        category,
        priceSort,
        status,
        published,
        dateSort,
      } = req.query;

      // Build filter object
      const filter = {};

      // Search by product name (case-insensitive)
      if (search && search.trim()) {
        filter.name = { $regex: search.trim(), $options: "i" };
      }

      // Filter by category
      if (category && category.trim() && category !== "all") {
        const categoryValue = category.trim();
        
        // Check if it's a valid MongoDB ObjectId (category ID)
        if (mongoose.Types.ObjectId.isValid(categoryValue) && categoryValue.length === 24) {
          // Filter by category ID (exact match)
          filter.category = categoryValue;
        } else {
          // It might be a category slug or name - look up the category first
          const foundCategory = await Category.findOne({
            $or: [
              { slug: categoryValue },
              { name: { $regex: new RegExp(`^${categoryValue}$`, "i") } }
            ]
          });
          
          if (foundCategory) {
            // Filter by category ID (since products store category as ID string)
            filter.category = foundCategory._id.toString();
          } else {
            // If category not found, also try direct name match (for backward compatibility)
            filter.category = { 
              $regex: new RegExp(`^${categoryValue}$`, "i") 
            };
          }
        }
      }

      // Filter by status
      if (status && status.trim()) {
        // Map frontend status values to backend values
        const statusMap = {
          "selling": "selling",
          "out-of-stock": "out of stock",
        };
        const mappedStatus = statusMap[status.trim()] || status.trim();
        filter.status = mappedStatus;
      }

      // Build sort object
      let sort = { createdAt: -1 }; // Default sort

      // Sort by price
      if (priceSort === "lowest-first") {
        sort = { salesPrice: 1 };
      } else if (priceSort === "highest-first") {
        sort = { salesPrice: -1 };
      }

      // Sort by date
      if (dateSort) {
        if (dateSort === "added-asc") {
          sort = { createdAt: 1 };
        } else if (dateSort === "added-desc") {
          sort = { createdAt: -1 };
        } else if (dateSort === "updated-asc") {
          sort = { updatedAt: 1 };
        } else if (dateSort === "updated-desc") {
          sort = { updatedAt: -1 };
        }
      }

      // Calculate pagination
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 10);
      const skip = (pageNum - 1) * limitNum;

      // Execute query with filters, sort, and pagination
      const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      // Get total count for pagination
      const totalItems = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / limitNum);

      // Get all unique category values from products
      const categoryValues = [...new Set(products.map(p => p.category).filter(Boolean))];
      
      // Look up categories by ID or name
      const categoryMap = new Map();
      if (categoryValues.length > 0) {
        // Separate valid ObjectIds from names
        const categoryIds = [];
        const categoryNames = [];
        
        categoryValues.forEach(val => {
          // Check if it's a valid MongoDB ObjectId
          if (mongoose.Types.ObjectId.isValid(val) && val.length === 24) {
            categoryIds.push(val);
          } else {
            categoryNames.push(val);
          }
        });
        
        // Build query conditions
        const queryConditions = [];
        if (categoryIds.length > 0) {
          queryConditions.push({ _id: { $in: categoryIds.map(id => new mongoose.Types.ObjectId(id)) } });
        }
        if (categoryNames.length > 0) {
          queryConditions.push({ name: { $in: categoryNames } });
        }
        
        // Find categories by ID or name
        const categoriesById = queryConditions.length > 0 
          ? await Category.find({ $or: queryConditions })
          : [];
        
        // Create a map for quick lookup
        categoriesById.forEach(cat => {
          // Map by ID (as string)
          categoryMap.set(cat._id.toString(), {
            name: cat.name,
            slug: cat.slug,
          });
          // Map by name (in case category was stored as name)
          categoryMap.set(cat.name, {
            name: cat.name,
            slug: cat.slug,
          });
        });
      }

      // Transform products to match frontend format
      const transformedProducts = products.map((product) => {
        const categoryValue = product.category || "";
        // Look up category name from the map
        const categoryInfo = categoryValue ? categoryMap.get(categoryValue) : null;
        
        // Handle images: use images array if available, otherwise fallback to image field for backward compatibility
        const productImages = product.images && Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : (product.image ? [product.image] : []);
        const mainImage = productImages.length > 0 ? productImages[0] : "";
        
        return {
          id: product._id.toString(),
          name: product.name || "",
          description: product.description || "",
          shortDescription: product.shortDescription !== undefined ? product.shortDescription : "",
          image_url: mainImage,
          images: productImages,
          sku: product.sku || "",
          cost_price: product.costPrice || 0,
          selling_price: product.salesPrice || 0,
          stock: product.quantity || 0,
          min_stock_threshold: product.minStockThreshold || 0,
          category_id: categoryValue,
          slug: product.slug || "",
          published: product.published !== undefined ? product.published : true,
          status: product.status || "draft",
          created_at: product.createdAt ? product.createdAt.toISOString() : new Date().toISOString(),
          updated_at: product.updatedAt ? product.updatedAt.toISOString() : new Date().toISOString(),
          categories: categoryInfo ? {
            name: categoryInfo.name,
            slug: categoryInfo.slug,
          } : null,
        };
      });

      // Format response to match frontend expectations
      return res.status(200).json({
        success: true,
        data: transformedProducts,
        pagination: {
          limit: limitNum,
          current: pageNum,
          items: totalItems,
          pages: totalPages,
          next: pageNum < totalPages ? pageNum + 1 : null,
          prev: pageNum > 1 ? pageNum - 1 : null,
        },
      });
    } catch (error) {
      console.error("Get Products Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      });
    }
  };

// Edit Product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Normalize body keys
    const normalizedBody = {};
    for (const key in req.body) {
      const trimmedKey = key.trim();
      normalizedBody[trimmedKey] = req.body[key];
    }
    
    // Handle existingImages - FormData may send multiple values with same name
    // Check if there are multiple existingImages values
    if (normalizedBody.existingImages) {
      // If it's already an array, use it; otherwise convert to array
      if (!Array.isArray(normalizedBody.existingImages)) {
        normalizedBody.existingImages = [normalizedBody.existingImages];
      }
      // Filter out empty values
      normalizedBody.existingImages = normalizedBody.existingImages.filter(img => img && img.trim() !== '');
    }

    const {
      name,
      description,
      shortDescription,
      sku,
      category,
      costPrice,
      salesPrice,
      quantity,
      minStockThreshold,
      slug,
      status,
    } = normalizedBody;

    // Build update object with only provided fields
    const updateData = {};

    // Handle name
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      updateData.name = name.trim();
    }

    // Handle description
    if (description !== undefined) {
      if (!description || typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
      }
      updateData.description = description.trim();
    }

    // Handle shortDescription
    if (shortDescription !== undefined) {
      if (!shortDescription || typeof shortDescription !== 'string' || !shortDescription.trim()) {
        return res.status(400).json({
          success: false,
          message: "Short description cannot be empty",
        });
      }
      const trimmedShortDesc = shortDescription.trim();
      if (trimmedShortDesc.length > 200) {
        return res.status(400).json({
          success: false,
          message: "Short description must be 200 characters or less",
        });
      }
      updateData.shortDescription = trimmedShortDesc;
    }

    // Handle SKU
    if (sku !== undefined) {
      if (!sku || typeof sku !== 'string' || !sku.trim()) {
        return res.status(400).json({
          success: false,
          message: "SKU cannot be empty",
        });
      }
      const trimmedSku = sku.trim();
      
      // Check if SKU already exists (excluding current product)
      const skuExists = await Product.findOne({ sku: trimmedSku, _id: { $ne: id } });
      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }
      updateData.sku = trimmedSku;
    }

    // Handle category
    if (category !== undefined) {
      if (!category || typeof category !== 'string' || !category.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be empty",
        });
      }
      updateData.category = category.trim();
    }

    // Handle cost price
    if (costPrice !== undefined) {
      const parsedCostPrice = parseFloat(costPrice);
      if (isNaN(parsedCostPrice)) {
        return res.status(400).json({
          success: false,
          message: "Cost price must be a valid number",
        });
      }
      if (parsedCostPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Cost price cannot be negative",
        });
      }
      updateData.costPrice = parsedCostPrice;
    }

    // Handle sales price
    if (salesPrice !== undefined) {
      const parsedSalesPrice = parseFloat(salesPrice);
      if (isNaN(parsedSalesPrice)) {
        return res.status(400).json({
          success: false,
          message: "Sales price must be a valid number",
        });
      }
      if (parsedSalesPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Sales price cannot be negative",
        });
      }
      updateData.salesPrice = parsedSalesPrice;
    }

    // Handle quantity
    if (quantity !== undefined) {
      const parsedQuantity = parseInt(quantity);
      if (isNaN(parsedQuantity)) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a valid number",
        });
      }
      if (parsedQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity cannot be negative",
        });
      }
      updateData.quantity = parsedQuantity;
    }

    // Handle min stock threshold
    if (minStockThreshold !== undefined) {
      const parsedMinStock = parseInt(minStockThreshold);
      if (isNaN(parsedMinStock)) {
        return res.status(400).json({
          success: false,
          message: "Min stock threshold must be a valid number",
        });
      }
      if (parsedMinStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Min stock threshold cannot be negative",
        });
      }
      updateData.minStockThreshold = parsedMinStock;
    }

    // Handle slug
    if (slug !== undefined || name !== undefined) {
      const slugValue = slug && typeof slug === 'string' ? slug.trim() : slug;
      const productName = updateData.name || existingProduct.name;
      const productSlug = slugValue && slugValue !== "" 
        ? slugify(slugValue, { lower: true, strict: true })
        : slugify(productName, { lower: true, strict: true });
      
      // Check if slug already exists (excluding current product)
      const slugExists = await Product.findOne({ slug: productSlug, _id: { $ne: id } });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "Product with this slug already exists",
        });
      }
      updateData.slug = productSlug;
    }

    // Handle status
    if (status !== undefined) {
      const validStatuses = ["selling", "out of stock", "draft"];
      const productStatus = status && typeof status === 'string' 
        ? status.trim() 
        : existingProduct.status;
      
      if (!validStatuses.includes(productStatus)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }
      updateData.status = productStatus;
    }

    // Handle images (optional - only update if provided)
    // Get existing images from product (handle both old 'image' field and new 'images' array)
    const currentExistingImages = existingProduct.images && Array.isArray(existingProduct.images) && existingProduct.images.length > 0
      ? existingProduct.images
      : (existingProduct.image ? [existingProduct.image] : []);
    
    // Get existing images from request body (sent from frontend to preserve images)
    const existingMainImageFromRequest = normalizedBody.existingMainImage 
      ? String(normalizedBody.existingMainImage).trim() 
      : null;
    const existingImagesFromRequest = Array.isArray(normalizedBody.existingImages) 
      ? normalizedBody.existingImages.filter(img => img && String(img).trim() !== '')
      : (normalizedBody.existingImages && String(normalizedBody.existingImages).trim() !== '' 
        ? [String(normalizedBody.existingImages).trim()] 
        : []);
    
    // Determine final images array
    let finalImages = [];
    
    // If new files are uploaded
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
      
      // Determine main image:
      // - If existingMainImage is provided, it means no new main image was uploaded, so use existing
      // - If existingMainImage is NOT provided but we have existing images, preserve the first existing image as main
      // - Only use a new file as main image if there are no existing images (new product scenario)
      // IMPORTANT: When editing existing product, preserve main image unless explicitly changed
      let finalMainImage = null;
      
      if (existingMainImageFromRequest) {
        // Main image explicitly preserved from frontend
        finalMainImage = existingMainImageFromRequest;
      } else if (currentExistingImages.length > 0) {
        // Editing existing product: preserve first existing image as main, all new files are additional
        finalMainImage = currentExistingImages[0];
      } else if (newImagePaths.length > 0) {
        // New product or no existing images: first new file is main image
        finalMainImage = newImagePaths[0];
      }
      
      // Build final images array: main image first, then existing additional images, then new additional images
      if (finalMainImage) {
        finalImages.push(finalMainImage);
      }
      
      // Add existing additional images (excluding main image)
      const existingAdditionalImages = existingImagesFromRequest.length > 0 
        ? existingImagesFromRequest 
        : (currentExistingImages.length > 1 ? currentExistingImages.slice(1) : []);
      
      // Filter out main image from existing additional images to avoid duplicates
      const filteredExistingAdditional = existingAdditionalImages.filter(img => {
        if (!img) return false;
        // Remove any image that matches the final main image
        return img !== finalMainImage && img !== existingMainImageFromRequest;
      });
      
      finalImages = [...finalImages, ...filteredExistingAdditional];
      
      // Add new additional images:
      // CRITICAL: 
      // - If existingMainImage was provided OR we have existing images, ALL new files are additional images
      // - Only if no existing images AND no existingMainImage, then first new file is main image
      const newAdditionalImages = (existingMainImageFromRequest || currentExistingImages.length > 0)
        ? newImagePaths  // All new files are additional when main image is preserved (editing scenario)
        : (newImagePaths.length > 1 ? newImagePaths.slice(1) : []); // Skip first (main), add rest (new product)
      
      if (newAdditionalImages.length > 0) {
        finalImages = [...finalImages, ...newAdditionalImages];
      }
      
      // Delete old image files that are being replaced (only if they're not in the final array)
      currentExistingImages.forEach((oldImagePath) => {
        // Only delete if this image is not in the final images array
        if (!finalImages.includes(oldImagePath) && oldImagePath && !oldImagePath.startsWith("data:")) {
          // Remove leading slash to make it relative for path.join
          const imagePathRelative = oldImagePath.startsWith("/") 
            ? oldImagePath.substring(1) 
            : oldImagePath;
          const fullImagePath = path.join(__dirname, "..", imagePathRelative);
          // Check if file exists before deleting
          if (fs.existsSync(fullImagePath)) {
            try {
              fs.unlinkSync(fullImagePath);
            } catch (error) {
              console.error("Error deleting old image file:", error);
              // Continue even if deletion fails
            }
          }
        }
      });
      
      updateData.images = finalImages;
      // Also set image field for backward compatibility (use first image)
      if (finalImages.length > 0) {
        updateData.image = finalImages[0];
      }
    } else if (existingMainImageFromRequest || existingImagesFromRequest.length > 0) {
      // No new files, but existing images are explicitly provided (user may have removed some)
      // Use the provided existing images
      const finalMainImage = existingMainImageFromRequest || (currentExistingImages.length > 0 ? currentExistingImages[0] : null);
      
      if (finalMainImage) {
        finalImages.push(finalMainImage);
      }
      
      // Add existing additional images
      const existingAdditionalImages = existingImagesFromRequest.length > 0 
        ? existingImagesFromRequest 
        : (currentExistingImages.length > 1 ? currentExistingImages.slice(1) : []);
      
      // Filter out main image from existing additional images
      const filteredExistingAdditional = existingAdditionalImages.filter(img => 
        img !== finalMainImage
      );
      
      finalImages = [...finalImages, ...filteredExistingAdditional];
      
      updateData.images = finalImages;
      if (finalImages.length > 0) {
        updateData.image = finalImages[0];
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Product Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete Product 
const deleteProduct = async (req, res) => {
    try {
        const { id} = req.params;

        // Check if product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Delete image files if they exist (handle both images array and old image field)
        const imagesToDelete = existingProduct.images && Array.isArray(existingProduct.images) && existingProduct.images.length > 0
            ? existingProduct.images
            : (existingProduct.image ? [existingProduct.image] : []);
        
        imagesToDelete.forEach((imagePath) => {
            if (imagePath && !imagePath.startsWith("data:")) {
                // Remove leading slash to make it relative for path.join
                const imagePathRelative = imagePath.startsWith("/") 
                    ? imagePath.substring(1) 
                    : imagePath;
                const fullImagePath = path.join(__dirname, "..", imagePathRelative);
                if (fs.existsSync(fullImagePath)) {
                    try {
                        fs.unlinkSync(fullImagePath);
                    } catch (error) {
                        console.error("Error deleting product image file:", error);
                        // Continue with deletion even if file deletion fails
                    }
                }
            }
        });

        // Delete product
        await Product.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

// Bulk Delete Products
const bulkDeleteProducts = async (req, res) => {
    try {
        const { productIds } = req.body;

        // Validate input
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Product IDs array is required",
            });
        }

        // Check if all products exist
        const existingProducts = await Product.find({ _id: { $in: productIds } });
        const foundIds = existingProducts.map(p => p._id.toString());
        const notFoundIds = productIds.filter(id => !foundIds.includes(id));

        if (notFoundIds.length > 0) {
            return res.status(404).json({
                success: false,
                message: `Some products not found: ${notFoundIds.join(", ")}`,
            });
        }

        // Delete image files for all products (handle both images array and old image field)
        existingProducts.forEach((product) => {
            const imagesToDelete = product.images && Array.isArray(product.images) && product.images.length > 0
                ? product.images
                : (product.image ? [product.image] : []);
            
            imagesToDelete.forEach((imagePath) => {
                if (imagePath && !imagePath.startsWith("data:")) {
                    // Remove leading slash to make it relative for path.join
                    const imagePathRelative = imagePath.startsWith("/") 
                        ? imagePath.substring(1) 
                        : imagePath;
                    const fullImagePath = path.join(__dirname, "..", imagePathRelative);
                    if (fs.existsSync(fullImagePath)) {
                        try {
                            fs.unlinkSync(fullImagePath);
                        } catch (error) {
                            console.error(`Error deleting image for product ${product._id}:`, error);
                        }
                    }
                }
            });
        });

        // Delete all products
        await Product.deleteMany({ _id: { $in: productIds } });
        
        return res.status(200).json({
            success: true,
            message: `${productIds.length} product(s) deleted successfully`,
        });
    } catch (error) {
        console.error("Bulk Delete Products Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

// Get Product By ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
        }

        // Find product by ID
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Convert product to plain object
        const productObj = product.toObject();

        // Handle images: use images array if available, otherwise fallback to image field for backward compatibility
        if (!productObj.images || !Array.isArray(productObj.images) || productObj.images.length === 0) {
          if (productObj.image) {
            productObj.images = [productObj.image];
          } else {
            productObj.images = [];
          }
        }
        
        // Ensure images array contains valid strings and filter out empty/invalid entries
        if (Array.isArray(productObj.images)) {
          productObj.images = productObj.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
        }
        
        // Set image_url and image fields for frontend compatibility
        productObj.image_url = productObj.images && productObj.images.length > 0 ? productObj.images[0] : (productObj.image || "");
        productObj.image = productObj.image_url;
        
        // Ensure shortDescription exists (for backward compatibility)
        if (!productObj.shortDescription) {
          productObj.shortDescription = "";
        }

        // Fetch category name if category is stored as ID
        let categoryName = product.category;
        if (product.category && mongoose.Types.ObjectId.isValid(product.category) && product.category.length === 24) {
            const category = await Category.findById(product.category);
            if (category) {
                categoryName = category.name;
                // Add category details to product object
                productObj.categories = {
                    name: category.name,
                    slug: category.slug,
                };
            }
        } else if (product.category) {
            // If category is stored as name, try to find it to get slug
            const category = await Category.findOne({ name: product.category });
            if (category) {
                productObj.categories = {
                    name: category.name,
                    slug: category.slug,
                };
            } else {
                // If category name not found in Category collection, use the stored value
                productObj.categories = {
                    name: product.category,
                    slug: null,
                };
            }
        }

        // Update category field with name
        productObj.category = categoryName;

        return res.status(200).json({
            success: true,
            product: productObj,
        });
    } catch (error) {
        console.error("Get Product By ID Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

module.exports = { addProduct, getAllProducts, editProduct, deleteProduct, getProductById, bulkDeleteProducts };

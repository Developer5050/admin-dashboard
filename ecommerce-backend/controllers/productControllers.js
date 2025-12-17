const Product = require("../models/Product");
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
    if (!name || !description || !sku || !category || !costPrice || !salesPrice || !quantity || !minStockThreshold) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        receivedFields: Object.keys(normalizedBody),
      });
    }

    // IMAGE CHECK
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    // Save file path instead of base64
    const productImage = `/uploads/products/${req.file.filename}`;

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
      image: productImage,
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

      // Filter by category (case-insensitive match)
      if (category && category.trim() && category !== "all") {
        filter.category = { 
          $regex: new RegExp(`^${category.trim()}$`, "i") 
        };
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

      // Note: published field doesn't exist in Product model, so we skip it
      // If you need published filtering, add it to the Product model first

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

      // Transform products to match frontend format
      const transformedProducts = products.map((product) => {
        const categoryValue = product.category || "";
        return {
          id: product._id.toString(),
          name: product.name || "",
          description: product.description || "",
          image_url: product.image || "",
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
          categories: categoryValue ? {
            name: categoryValue,
            slug: null,
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

    const {
      name,
      description,
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

    // Handle image (optional - only update if provided)
    if (req.file) {
      // Delete old image file if it exists and is not a base64 data URL
      if (existingProduct.image && !existingProduct.image.startsWith("data:")) {
        // Remove leading slash to make it relative for path.join
        const imagePathRelative = existingProduct.image.startsWith("/") 
          ? existingProduct.image.substring(1) 
          : existingProduct.image;
        const oldImagePath = path.join(__dirname, "..", imagePathRelative);
        // Check if file exists before deleting
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (error) {
            console.error("Error deleting old image file:", error);
            // Continue even if deletion fails
          }
        }
      }
      // Save new file path
      updateData.image = `/uploads/products/${req.file.filename}`;
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

        // Delete image file if it exists
        if (existingProduct.image && !existingProduct.image.startsWith("data:")) {
            // Remove leading slash to make it relative for path.join
            const imagePathRelative = existingProduct.image.startsWith("/") 
                ? existingProduct.image.substring(1) 
                : existingProduct.image;
            const imagePath = path.join(__dirname, "..", imagePathRelative);
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                } catch (error) {
                    console.error("Error deleting product image file:", error);
                    // Continue with deletion even if file deletion fails
                }
            }
        }

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

        // Delete image files for all products
        existingProducts.forEach((product) => {
            if (product.image && !product.image.startsWith("data:")) {
                // Remove leading slash to make it relative for path.join
                const imagePathRelative = product.image.startsWith("/") 
                    ? product.image.substring(1) 
                    : product.image;
                const imagePath = path.join(__dirname, "..", imagePathRelative);
                if (fs.existsSync(imagePath)) {
                    try {
                        fs.unlinkSync(imagePath);
                    } catch (error) {
                        console.error(`Error deleting image for product ${product._id}:`, error);
                    }
                }
            }
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

        return res.status(200).json({
            success: true,
            product,
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

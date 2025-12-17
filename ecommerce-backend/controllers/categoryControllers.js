const Category = require("../models/Category");
const slugify = require("slugify");
const path = require("path");
const fs = require("fs");

// Add Category
const createCategory = async (req, res) => {
    try {
        const normalizedBody = {};

        for (const key in req.body) {
            const trimmedKey = key.trim();
            normalizedBody[trimmedKey] = req.body[key];
        }

        const { name, description, slug, status } = normalizedBody;

        // Validate required fields
        if (!name || !description || !slug || !status) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                receivedFields: Object.keys(normalizedBody),
            });
        }

        // Save file path
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Category image is required",
            });
        }

        // Save file path
        const categoryImage = `/uploads/categories/${req.file.filename}`;


        // Generate slug
        const categorySlug = slugify(slug.trim(), {
            lower: true,
            strict: true,
        });

        // Validate slug
        if (!categorySlug) {
            return res.status(400).json({
                success: false,
                message: "Invalid slug",
            });
        }


        // Existing Slug Check
        const existingSlug = await Category.findOne({ slug });
        if (existingSlug) {
            return res.status(400).json({
                success: false,
                message: "Category with this slug already exists",
                slug: categorySlug,
            });
        }

        // Category Check 
        const existingCategory = await Category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists",
            });
        }

        // Create Category
        const newCategory = await Category.create({
            name: name.trim(),
            description: description.trim(),
            image: categoryImage,
            slug: categorySlug,
            status: status.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category: newCategory,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Get All Categories
const getAllCategories = async (req, res) => {
    try {
        // Extract query parameters
        const {
            page = 1,
            limit = 10,
            search,
        } = req.query;

        // Build filter object
        const filter = {};

        // Search by category name (case-insensitive)
        if (search && search.trim()) {
            filter.name = { $regex: search.trim(), $options: "i" };
        }

        // Calculate pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 10);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with filters and pagination
        const categories = await Category.find(filter)
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const totalItems = await Category.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / limitNum);

        // Transform categories to match frontend format
        const transformedCategories = categories.map((category) => {
            return {
                id: category._id.toString(),
                name: category.name || "",
                description: category.description || "",
                image_url: category.image || "",
                slug: category.slug || "",
                status: category.status || "active",
                created_at: category.createdAt ? category.createdAt.toISOString() : new Date().toISOString(),
                updated_at: category.updatedAt ? category.updatedAt.toISOString() : new Date().toISOString(),
            };
        });

        // Format response to match frontend expectations
        return res.status(200).json({
            success: true,
            data: transformedCategories,
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
        console.error("Get Categories Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
            error: error.message,
        });
    }
};

// Edit Category
const editCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category exists
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Normalize body keys
        const normalizedBody = {};
        for (const key in req.body) {
            normalizedBody[key.trim()] = req.body[key];
        }

        const { name, description, slug, status } = normalizedBody;

        // Required fields check
        if (!name || !description || !slug || !status) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                receivedFields: Object.keys(normalizedBody),
            });
        }

        // Generate slug
        const categorySlug = slugify(slug.trim(), {
            lower: true,
            strict: true,
        });

        if (!categorySlug) {
            return res.status(400).json({
                success: false,
                message: "Invalid slug",
            });
        }

        // Slug duplicate check
        const existingSlug = await Category.findOne({
            slug: categorySlug,
            _id: { $ne: id },
        });
        if (existingSlug) {
            return res.status(400).json({
                success: false,
                message: "Category with this slug already exists",
            });
        }

        // Name duplicate check
        const existingCategoryName = await Category.findOne({
            name: name.trim(),
            _id: { $ne: id },
        });
        if (existingCategoryName) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists",
            });
        }

        // Build update object
        const updateData = {
            name: name.trim(),
            description: description.trim(),
            slug: categorySlug,
            status,
        };

        // Image update (optional)
        if (req.file) {
            updateData.image = `/uploads/categories/${req.file.filename}`;
        }

        // Update category
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory,
        });

    } catch (error) {
        console.error("Edit Category Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};


// Delete Category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category exists
        const existingCategory = await Category.findById(id);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Delete image file if it exists
        if (existingCategory.image && !existingCategory.image.startsWith("data:")) {
            // Remove leading slash to make it relative for path.join
            const imagePathRelative = existingCategory.image.startsWith("/")
                ? existingCategory.image.substring(1)
                : existingCategory.image;
            const imagePath = path.join(__dirname, "..", imagePathRelative);

            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                } catch (error) {
                    console.error("Error deleting category image file:", error);
                }
            }
        }

        // Delete category
        await Category.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("Delete Category Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = { createCategory, getAllCategories, deleteCategory, editCategory };
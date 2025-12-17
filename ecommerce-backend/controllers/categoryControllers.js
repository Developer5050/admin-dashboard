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
        const existingCategory = await Category.findOne({ name : name.trim()});
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

module.exports = { createCategory, deleteCategory };
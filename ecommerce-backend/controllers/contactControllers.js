const Contact = require("../models/Contact");

// Create Contact
const createContact = async (req, res) => {
    try {
        const normalizedBody = {};
        for (const key in req.body) {
            const trimmedKey = key.trim();
            normalizedBody[trimmedKey] = req.body[key];
        }

        const { name, email, phone, subject, message } = normalizedBody;

        // Validate required fields
        if (!name || !email || !phone || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                receivedFields: Object.keys(normalizedBody),
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        // Create Contact
        const newContact = await Contact.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            subject: subject.trim(),
            message: message.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Contact message submitted successfully",
            contact: newContact,
        });

    } catch (error) {
        console.error("Contact Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get All Contacts
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Contacts retrieved successfully",
            contacts: contacts,
            count: contacts.length,
        });

    } catch (error) {
        console.error("Get All Contacts Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get Contact By ID
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Contact ID is required",
            });
        }

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact retrieved successfully",
            contact: contact,
        });

    } catch (error) {
        console.error("Get Contact By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Delete Contact
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Contact ID is required",
            });
        }

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact deleted successfully",
            contact: contact,
        });

    } catch (error) {
        console.error("Delete Contact Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Bulk Delete Contacts
const bulkDeleteContacts = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Contact IDs array is required",
            });
        }

        const result = await Contact.deleteMany({ _id: { $in: ids } });

        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} contact(s) deleted successfully`,
            deletedCount: result.deletedCount,
        });

    } catch (error) {
        console.error("Bulk Delete Contacts Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = {
    createContact,
    getAllContacts,
    getContactById,
    deleteContact,
    bulkDeleteContacts,
};

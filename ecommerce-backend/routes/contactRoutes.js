const express = require("express");
const router = express.Router();
const {
    createContact,
    getAllContacts,
    getContactById,
    deleteContact,
    bulkDeleteContacts,
} = require("../controllers/contactControllers");
const authMiddleware = require("../middleware/authMiddleware");

// Create Contact Route (public - no auth required for form submission)
router.post("/create-contact", createContact);

// Get All Contacts Route (admin only)
router.get("/get-all-contacts", authMiddleware, getAllContacts);

// Get Contact By ID Route (admin only)
router.get("/get-contact-by-id/:id", authMiddleware, getContactById);

// Delete Contact Route (admin only)
router.delete("/delete-contact/:id", authMiddleware, deleteContact);

// Bulk Delete Contacts Route (admin only)
router.delete("/bulk-delete-contacts", authMiddleware, bulkDeleteContacts);

module.exports = router;

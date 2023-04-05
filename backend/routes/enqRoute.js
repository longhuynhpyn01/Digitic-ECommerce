const express = require("express");
const {
    createEnquiry,
    getAllEnquiries,
    getEnquiry,
    updateEnquiry,
    deleteEnquiry
} = require("../controllers/enqController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, isAdmin, createEnquiry);
router.get("/", getAllEnquiries);
router.get("/:id", getEnquiry);
router.put("/:id", authMiddleware, isAdmin, updateEnquiry);
router.delete("/:id", authMiddleware, isAdmin, deleteEnquiry);

module.exports = router;

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "quiz/questions",
    allowed_formats: ["jpg", "png", "webp"],
    public_id: () => `q_${Date.now()}`,
  },
});

module.exports = multer({ storage });

//this is uploadmiddleware.js

import multer from "multer";
import path from "path";

/* ===============================
   MULTER STORAGE CONFIG
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      "E:/Dr.Doom Vault/SkillsDuel/Skill2Duels/SkillDuel/images"
    );
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `avatar-${req.user.id}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

/* ===============================
   FILE FILTER
================================ */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

export default upload;

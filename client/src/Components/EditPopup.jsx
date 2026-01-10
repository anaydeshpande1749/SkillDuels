//this is editpopup.jsx to editprofile

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function EditProfilePopup({ isOpen, onClose, user, onSave }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* -------------------------------
     RESET STATE ON OPEN
  -------------------------------- */
  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPassword("");
      setPreview(user.filePath || null);
      setImage(null);
      setError("");
    }
  }, [isOpen, user]);

  /* -------------------------------
     IMAGE PREVIEW
  -------------------------------- */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* -------------------------------
     SAVE PROFILE (FIXED)
  -------------------------------- */
  const handleEditProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      let uploadedFilePath = user.filePath;

      /* 1️⃣ Upload Avatar */
      if (image) {
        const formData = new FormData();
        formData.append("avatar", image);

        const uploadRes = await axios.post(
          `${API_BASE}/api/users/upload-avatar`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );

        uploadedFilePath = uploadRes.data.filePath;
      }

      /* 2️⃣ Update Username / Password */
      const payload = { username };
      if (password.trim()) payload.password = password;

      const updateRes = await axios.put(
        `${API_BASE}/api/users/update-profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      /* 3️⃣ Sync Parent State */
      onSave({
        username: updateRes.data.user.profile.username,
        email: updateRes.data.user.email,
        filePath: uploadedFilePath
      });

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div className="w-[420px] rounded-2xl bg-[#0B0B0F] border border-[#1F2937] p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-white text-xl">Edit Profile</h2>
              <button onClick={onClose}><X /></button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              <label className="mt-3 text-blue-400 cursor-pointer">
                <Upload size={16} /> Upload Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <input
              className="w-full mb-3 p-2 bg-[#111827] border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />

            <input
              className="w-full mb-3 p-2 bg-[#0f172a] border rounded text-gray-500"
              value={email}
              disabled
            />

            <input
              className="w-full mb-3 p-2 bg-[#111827] border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              type="password"
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleEditProfile}
              disabled={loading}
              className="w-full mt-4 bg-blue-600 p-2 rounded text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

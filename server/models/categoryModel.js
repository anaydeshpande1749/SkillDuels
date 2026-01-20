//this is categorymodel.js

import mongoose from "mongoose";



const categorySchema = new mongoose.Schema({
    name: { type: String, required: true,unique:true },
    description: { type: String, default: "" },
    timePerQuestion: { type: Number, default: 30 },
        difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    questionCount: { type: Number, default: 0 }

  },
  { timestamps: true }
)

const categoryModel = mongoose.models.category || mongoose.model("category",categorySchema)

export default categoryModel
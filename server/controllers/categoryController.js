//this is categorycontroller.js

import categoryModel from "../models/categoryModel.js";
import questionModel from "../models/questionModel.js";



/* ================= ADD CATEGORY ================= */
export const addCategory = async (req, res) => {
     const category = new categoryModel({
      name:req.body.name,
      description:req.body.description,
      timePerQuestion:req.body.timePerQuestion,
      difficulty:req.body.difficulty
    });
  try {
 console.log(category)
await category.save();
    res.status(201).json({
      success: true,
      message: "Category created",
      data: category, // 🔥 frontend uses _id from here
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};



/* ================= GET ALL CATEGORIES ================= */
export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find().sort({ createdAt: -1 });


    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};


/* ================= DELETE CATEGORY (CASCADE) ================= */
export const deleteCategory = async (req, res) => {
  try {
    
 const{id} = req.params;
    await questionModel.deleteMany({ category:id });
    await categoryModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Category and related questions deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

/* ================= GET QUESTIONS BY CATEGORY ================= */
export const getQuestionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const questions = await questionModel
      .find({ category: categoryId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
};
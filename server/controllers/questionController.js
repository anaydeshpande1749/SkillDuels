//this is questionscontroller.js

import categoryModel from "../models/categoryModel.js";
import questionModel from "../models/questionModel.js";



/* ================= ADD QUESTION ================= */
export const addQuestion = async (req, res) => {
  try {
    const {
      categoryId,
      question,
      options,
      correctAnswer,
    } = req.body;

    /* Validate category */
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /* Validate options */
    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "Options must contain exactly 4 values",
      });
    }

    const newQuestion = await questionModel.create({
      category: categoryId,
      question,
      options,
      correctAnswer,
     
    });
await categoryModel.findByIdAndUpdate(categoryId,{$inc:{questionCount:1}})
    res.status(201).json({
      success: true,
      message: "Question added",
      data: newQuestion,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add question",
    });
  }
};

export const getQuestions = async (req,res) => {
  try {
    const question= await questionModel.find().populate("category","name difficulty timePerQuestion");
        res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
     console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
}


export const deleteQuestion = async (req,res) => {
  try {
    const{id} = req.params;
    await questionModel.findByIdAndDelete(id);
    await categoryModel.findByIdAndUpdate(req.body.cat_id,{$inc:{questionCount:-1}})
    res.json({success:true,message:"Question deleted Successfully"})

  } catch (error) {
     console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Error to delete",
    });
  }
}


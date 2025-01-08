import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Project } from "../models/projectSchema.js";
import { v2 as cloudinary } from "cloudinary";

// Add New Project
export const addNewProject = catchAsyncErrors(async (req, res, next) => {
  // Ensure project banner is uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Project Banner Image Required!", 400));
  }

  const { projectBanner } = req.files;
  const {
    title,
    description,
    gitRepoLink,
    projectLink,
    stack,
    technologies,
    deployed,
  } = req.body;

  // Validate all required fields
  if (
    !title ||
    !description ||
    !gitRepoLink ||
    !projectLink ||
    !stack ||
    !technologies ||
    !deployed
  ) {
    return next(new ErrorHandler("Please Provide All Details!", 400));
  }

  // Upload banner image to Cloudinary
  const cloudinaryResponse = await cloudinary.uploader.upload(
    projectBanner.tempFilePath,
    { folder: "PORTFOLIO PROJECT IMAGES" }
  );

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error");
    return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 500));
  }

  // Create new project
  const project = await Project.create({
    title,
    description,
    gitRepoLink,
    projectLink,
    stack,
    technologies,
    deployed,
    projectBanner: {
      public_id: cloudinaryResponse.public_id, // Cloudinary public ID
      url: cloudinaryResponse.secure_url, // Cloudinary secure URL
    },
  });

  res.status(201).json({
    success: true,
    message: "New Project Added!",
    project,
  });
});

// Update Project
export const updateProject = catchAsyncErrors(async (req, res, next) => {
  // Prepare new project data
  const newProjectData = {
    title: req.body.title,
    description: req.body.description,
    stack: req.body.stack,
    technologies: req.body.technologies,
    deployed: req.body.deployed,
    projectLink: req.body.projectLink,
    gitRepoLink: req.body.gitRepoLink,
  };

  // Handle banner image upload if available
  if (req.files && req.files.projectBanner) {
    const projectBanner = req.files.projectBanner;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorHandler("Project not found!", 404));
    }

    // Delete the old project image from Cloudinary
    const projectImageId = project.projectBanner.public_id;
    await cloudinary.uploader.destroy(projectImageId);

    // Upload new project image to Cloudinary
    const newProjectImage = await cloudinary.uploader.upload(
      projectBanner.tempFilePath,
      {
        folder: "PORTFOLIO PROJECT IMAGES",
      }
    );

    // Set new project image data
    newProjectData.projectBanner = {
      public_id: newProjectImage.public_id,
      url: newProjectImage.secure_url,
    };
  }

  // Update project in the database
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    newProjectData,
    {
      new: true, // Return the updated project
      runValidators: true, // Ensure the validation rules are followed
      useFindAndModify: false, // Avoid using the deprecated method
    }
  );

  // If project not found, return error
  if (!project) {
    return next(new ErrorHandler("Project not found!", 404));
  }

  res.status(200).json({
    success: true,
    message: "Project Updated!",
    project,
  });
});

// Delete Project
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  // Find project by ID
  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler("Project not found!", 404));
  }

  // Delete project image from Cloudinary
  const projectImageId = project.projectBanner.public_id;
  await cloudinary.uploader.destroy(projectImageId);

  // Delete the project from the database
  await project.deleteOne();

  res.status(200).json({
    success: true,
    message: "Project Deleted!",
  });
});

// Get All Projects
export const getAllProjects = catchAsyncErrors(async (req, res, next) => {
  const projects = await Project.find();
  res.status(200).json({
    success: true,
    projects,
  });
});

// Get Single Project
export const getSingleProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return next(new ErrorHandler("Project not found!", 404));
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    return next(new ErrorHandler("Project not found!", 404));
  }
});

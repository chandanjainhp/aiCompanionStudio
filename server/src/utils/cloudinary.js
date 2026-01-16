import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import path from "path"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        // Normalize the file path to handle Windows/Unix path differences
        const normalizedPath = path.resolve(localFilePath);
        
        // Check if file exists before attempting upload
        if (!fs.existsSync(normalizedPath)) {
            console.log("File does not exist at path:", normalizedPath);
            return null;
        }
        
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(normalizedPath, {
            resource_type: "auto"
        });
        
        // File has been uploaded successfully
        console.log("File uploaded to Cloudinary:", response.url);
        
        // Remove the local file after successful upload
        fs.unlinkSync(normalizedPath);
        return response;

    } catch (error) {
        console.log("Error uploading to Cloudinary:", error);
        
        // Try to remove the local file if it exists
        try {
            const normalizedPath = path.resolve(localFilePath);
            if (fs.existsSync(normalizedPath)) {
                fs.unlinkSync(normalizedPath);
            }
        } catch (unlinkError) {
            console.log("Error removing local file:", unlinkError);
        }
        
        return null;
    }
}

export {uploadOnCloudinary}
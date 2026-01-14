import {v2 as cloudinary} from "cloudinary" ; 

import dotenv from "dotenv" ; 

dotenv.config() ; 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
    api_key: process.env.CLOUDINARY_API_KEY ,
    api_secret: process.env.CLOUDINARY_API_SECRET ,
})

// write upload funtion here 


const cloudinaryUpload = async (file) => {
    try {
        if(!file) {
            console.log("No file data provide") ; 
            return null ; 
        }
        const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString("base64")}` , {
            resource_type: "auto" , 
            folder: "STACKCART_SPACE"
        }) ; 
        return result ; 
    }catch(error) {
        console.log("Error in uploading file on cloudinary" , error) ; 
        return null ; 
    }
}

// delte cloudinary

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.log("No public ID provided to delete from Cloudinary.");
      return false; // Return false to indicate failure
    }

    // The destroy method deletes the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log(`Image with public ID ${publicId} deleted successfully.`);
      return true; // Return true on success
    } else {
      console.error(`Failed to delete image with public ID ${publicId}. Result:`, result);
      return false; // Return false on failure
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return false;
  }
};



export  { cloudinaryUpload, deleteFromCloudinary };  
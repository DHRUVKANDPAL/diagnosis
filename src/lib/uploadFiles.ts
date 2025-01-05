import axios from "axios";

export const uploadFile = async (
  file: File,
  setProgress: (progress: number) => void,
): Promise<string> => {
  try {
    // Get signed parameters from the API route
    const { data } = await axios.post("/api/cloudinary/signature");
    const { signature, timestamp, cloud_name, api_key, folder } = data;

    // Prepare the form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", api_key);
    formData.append("timestamp", timestamp.toString());
    formData.append("folder", folder);
    formData.append("signature", signature);

    // Upload the file to Cloudinary
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloud_name}/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setProgress(progress);
        },
      },
    );

    return response.data.secure_url; // Return the uploaded file's URL
  } catch (error) {
    console.error("File upload failed:", error);
    throw new Error("Failed to upload file");
  }
};

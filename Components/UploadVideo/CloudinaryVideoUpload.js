
const CloudinaryVideoUpload = async ({ file }) => {

    const data = new FormData();
    data.append("file", file); // "file" is required
    data.append("upload_preset", "video_uploads"); 
    data.append("cloud_name", "ddjdrsjn3");
  
    const res = await fetch("https://api.cloudinary.com/v1_1/ddjdrsjn3/video/upload", {
      method: "POST",
      body: data,
    });
  
    if (!res.ok) {
      throw new Error("Video upload failed");
    }
  
    const uploadResponse = await res.json();
    const videoUrl = uploadResponse.secure_url; //videoID
    const publicId = uploadResponse.public_id;
  
    return { videoUrl, publicId };
  };
  
  export default CloudinaryVideoUpload;
  
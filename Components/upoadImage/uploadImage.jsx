

const uploadImage = async ({file}) => {

    const data = new FormData();
    data.append("file", file) //"file" is fixed keyword for cloudin
    data.append("upload_preset", "profile_images");
    data.append("cloud_name", "ddjdrsjn3");

    const res = await fetch("https://api.cloudinary.com/v1_1/ddjdrsjn3/image/upload", {
        method: "POST",
        body: data
    });
    const uploadResponse = await res.json();
    const imageUrl = uploadResponse.secure_url; // URL of image
    const publicId = uploadResponse.public_id; // ID  of image

    return { imageUrl, publicId };
}

export default uploadImage

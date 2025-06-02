import React, { useRef, useState } from "react";
import "./uploadVideo.css";
import CloudinaryVideoUpload from './CloudinaryVideoUpload';
import { auth, db } from "../../Firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {useNavigate} from 'react-router-dom'
import Loader from '../Loader/Loader.jsx' ;
import { toast } from 'react-hot-toast';


const UploadVideo = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    file: null,
  });
  const fileInputRef =useRef(null);
 const navigate = useNavigate();
 const [loader,setLoader]=useState(false);

  const handleChange = (event) => {
    const inputValue =
      event.target.name === "file" ? event.target.files[0] : event.target.value;

    setForm({
      ...form,
      [event.target.name]: inputValue,
    });
  };

  const handleSubmit = async(event) => {
    event.preventDefault();

    try {
      if(form.file){
         
        setLoader(true);
        // cloudinary video upload,fn is in ./CloudinaryVideoUpload
        const {videoUrl} =  await CloudinaryVideoUpload({file:form.file});

      const transformedUrl = videoUrl.replace("/upload/", "/upload/f_mp4/"); //to convert video into mp4 for playing
      const videoData ={
        videoUrl:transformedUrl,
        title:form.title,
        description:form.description,
        uploaderId:auth.currentUser.uid,
        uploadedAt: serverTimestamp(),
      }
      
      // adding videoUrl in firestore
      const upload = await addDoc(collection(db, "videos"), videoData);
       if(upload){
         setLoader(false);
         toast.success('Successfully uploaded');
        navigate("/");
       }
       
      }  

    } catch (error) {
       console.log(error);
       setLoader(false);
    }
      
    setForm({title:"",description:"",file:null});
    if(fileInputRef.current){

      fileInputRef.current.value=null;
    }
  };

  return loader ? (
    <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100%",
    }}
  >
    <Loader />
  </div>
  ) : (
    <div className="upload-container">
      <div className="upload-card">
        <h4 className="text-center mb-4">Upload Video</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title & Id</label>
            <input
              onChange={handleChange}
              value={form.title}
              type="text"
              name="title"
              className="form-control"
              placeholder="Enter video title"
              required
            />
          </div>
  
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              onChange={handleChange}
              value={form.description}
              name="description"
              className="form-control"
              rows="3"
              placeholder="Enter video description"
              required
            ></textarea>
          </div>
  
          <div className="form-group">
            <label className="form-label">Upload Video</label>
            <input
              onChange={handleChange}
              ref={fileInputRef}
              accept="video/mp4,video/webm"
              name="file"
              type="file"
              className="form-control"
              required
            />
          </div>
  
          <button type="submit" className="upload-btn">
            Upload Video
          </button>
        </form>
      </div>
    </div>
  );
  
};

export default UploadVideo;

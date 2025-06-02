import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import '../Register.css'    //css from register.css
import { updateProfile } from "firebase/auth";
import { auth,db } from "../../Firebase/config";
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import './Account.css'
import uploadImage from '../upoadImage/uploadImage';
import Loader from '../Loader/Loader';
import { toast } from 'react-hot-toast';

const Account = () => {

  const [username,setUsername] =useState("");
  const [image, setImage] = useState("");
  const [publicId, setPublicId] = useState("");
  const [loader,setLoader] =useState("");
  const navigate = useNavigate();

      if(!auth.currentUser){
         navigate("/login");
      }
    const user = auth.currentUser;
    console.log(user.displayName);
    // console.log(user.uid);
    // console.log(user.photoURL);
 

    useEffect(()=>{

      if(!user) return; 

     const fetchUserImage=async()=>{
      try {

           setLoader(true);
        const usersRef = collection(db, "users"); //get image from database when render,not from user.photoUrl
        const q = query(usersRef, where("id", "==", user.uid));
        const querySnapshot = await getDocs(q);
   
        if(!querySnapshot.empty){
          const userData = querySnapshot.docs[0].data(); // Get document data
          
           setImage(userData.imageUrl);
           setUsername(userData.user);
           setPublicId(userData.publicId);
           setLoader(false);  
        }
        
      } catch (error) {
        console.log(error.message);
        
      }
     }
  
      fetchUserImage();

    },[],[user])


    // file upload using cloudinary
    const handleImageChange = async(e) => {
      const file = e.target.files[0];
      if (!file) return ;

      setLoader(true);
      const {imageUrl, publicId: publicIdNew} = await uploadImage({file}); //calling fn, Function is in ../upoadImage/uploadImage folder
      setImage(imageUrl); // image url from cloudinary
      setPublicId(publicIdNew);
      setLoader(false);
    };



    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if(user && username){
        try {

          setLoader(true);
         // Updating display name and photoURL in Firebase Authentication to get retreive from const user=auth,currentUser ,user.displayName & user.photoUrl
         await updateProfile(user, { displayName: username, photoURL: image });

        // finding document from firestore - update a firestore document using user.uid
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("id", "==", user.uid));
        const querySnapshot = await getDocs(q);
             
          const userDoc = querySnapshot.docs[0];  // First matching document ,to get document id
          const userRef = userDoc.ref;  
          
           await updateDoc(userRef,{
           user:username,
           imageUrl:image,
           publicId:publicId
          })
          
          setLoader(false);
          toast.success('Updated SucessFully')
        navigate("/");

      } catch (error) {
        
        toast.error(error.message);
          
      }
    }
  
    };
    
  return (
    <div className="register-container">

      {loader?(
        <Loader/>
      ):(

   
      <div className="register-box">
        <h2>Edit Account</h2>
       
              {/* Profile Image Upload */}
              <div className="profile-image-container">
          <label htmlFor="profileImage"> {/* id of input == label to make image clickable for edit*/}
            <img
              src={ image||"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJizcjGFENRhxpe0e_yrsCJ0jIR9qTj7jp6A&s"} // Default or uploaded image
              alt="Profile"
              className="profile-image"
            />
          </label>
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
       
        <form onSubmit={handleSubmit} noValidate>
       
          {/* username Input */}
          <div className="input-field">
            <input
              type="username"
              value={username} onChange={(e)=>setUsername(e.target.value)}
              autoComplete="off"
            />
            <label>Username</label>
          </div>

          <button type="submit">Update</button>

          
          <p style={{ color: "#FFD700", cursor: "pointer",textDecoration:"underline"}} onClick={() => navigate("/changePasswordAccount")}>  Change Password?</p>

        </form>
      </div>
         )
        }
    </div>
  )
}

export default Account

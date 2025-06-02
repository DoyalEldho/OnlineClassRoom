import { signInWithPopup } from 'firebase/auth';
import React from 'react'
import { auth, db, googleProvider } from '../../Firebase/config';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import {  doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

// The Firebase Authentication system handles login & signup automatically.
const Signup = () => {
    const navigate =useNavigate();
    const handleGoogleLogin = async () => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
          console.log("User:", user);

          const userRef = doc(db, "users", user.uid);  
          const userSnap = await getDoc(userRef);

          if(!userSnap.exists()){
            const role = prompt("enter role");

            if(!role){
              toast.error("Role Required");
              return;
            }
            await setDoc(userRef,{ id:user.uid ,role:role.trim(),user:user.displayName,curDate:serverTimestamp() } )
          }
        
          
           toast.success(`Welcome ${user.displayName}!`);

           navigate('/');
           

        } catch (error) {
          console.error("Google Sign-In Error:", error.message);
        }
      };
  return (
    
  <div className='signup-box' onClick={handleGoogleLogin} >Continue with Google</div>

   
  )
}

export default Signup

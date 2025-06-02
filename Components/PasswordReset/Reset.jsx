import React from 'react'
import '../Register.css'
import { useForm } from "react-hook-form";
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../Firebase/config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';


const Reset = () => {
    const navigate=useNavigate();

    const {register,handleSubmit,formState: { errors }} = useForm();

    const  onSubmit=async(data)=>{

        try {
             
            await sendPasswordResetEmail(auth,data.email)

            toast.success("Password reset email sent. Check your inbox.", {
              style: {
                border: '1px solid #713200',
                padding: '16px',
                color: '#713200',
              },
              iconTheme: {
                primary: '#713200',
                secondary: '#FFFAEE',
              },
            });

            navigate("/login");
           
        } catch (error) {
            
            console.log(error.message);
            
        }
    }
  
    return (
    
    <div className="register-container">
    <div className="register-box">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email Input */}
        <div className="input-field">
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Enter a valid email address",
              },
            })}
            autoComplete="off"
          />
          <label>Email</label>
          {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
        </div>

        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  </div>
  )
}

export default Reset

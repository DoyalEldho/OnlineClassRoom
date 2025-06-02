import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import '../Register.css'    //css from register.css
import Signup from "../GoogleSignup/Signup";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase/config";
import { toast } from 'react-hot-toast';


const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit =  (data) => {
   
    signInWithEmailAndPassword(auth, data.email, data.password)
     
    .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    if(user){

      toast.success('Login SucessFully')
        navigate('/');
    }
    
  })
  .catch((error) => {
    console.log(error.message);
    toast.error("Email or password does not match");
  });
   


  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Login</h2>
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

          {/* Password Input */}
          <div className="input-field">
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters long" },
              })}
              autoComplete="off"
            />
            <label>Password</label>
            {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
          </div>

          <button type="submit">Login</button>
            <Signup login={true} />

          <p style={{ color: "#fff" }}>
            Don't have an account?{" "}
            <span style={{ color: "blue", cursor: "pointer" }} onClick={() => navigate("/register")}>
              Register
            </span>
          </p>
          OR
          <p style={{ color: "#FFD700", cursor: "pointer",textDecoration:"underline" }} onClick={() => navigate("/resetPassword")}>  Forgot Password?</p>

        </form>
      </div>
    </div>
  );
};

export default Login;

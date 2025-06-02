import React, { useState } from 'react'
import '../Register.css'
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Loader from '../Loader/Loader';
import { auth } from '../../Firebase/config';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { toast } from 'react-hot-toast';

const ChangePassword = () => {

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors },reset } = useForm();


  if (!auth.currentUser) return navigate('/login');
  const user = auth.currentUser;
  //  console.log(user);

  const onSubmit = async (data, e) => {
    e.preventDefault();
    try {
      
      setIsLoading(true);
      const credential = EmailAuthProvider.credential(user.email, data.oldPassword);
      await reauthenticateWithCredential(user, credential); //checking email and password for authnciate user
      await updatePassword(user, data.confirmPassword); //updating passsword

      toast.success('Password Updated')
       setIsLoading(false);
       reset();
       navigate('/');

    } catch (error) {
      setIsLoading(false);
      toast.error("Incorrect Password")
    }
  }


  return (
    <div className="register-container">
      {isLoading ? (
        <Loader />
      ) : (

        <div className="register-box">
          <h2>Manage Password</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            <div className="input-field">
              <input type="text"   {...register("oldPassword",
                {
                  required: { value: true, message: "Current password is required" }
                }
              )} autoComplete="off" />

              <label>Current Password</label>
              {errors.oldPassword?.message && <p style={{ color: "red" }}>{errors.oldPassword.message}</p>}
            </div>


            <div className="input-field">
              <input type="password"
                {...register("password", {
                  required: { value: true, message: "Password is required" },
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long"
                  },
                  // validate fn must be outside  required:{}
                  validate: (value) => {
                    if (!/[A-Z]/.test(value)) {
                      return "Password must contain at least one uppercase letter";
                    }
                    if (!/[a-z]/.test(value)) {
                      return "Password must contain at least one lowercase letter";
                    }
                    if (!/[0-9]/.test(value)) {
                      return "Password must contain at least one number";
                    }
                    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                      return "Password must contain at least one special character";
                    }
                    return true;
                  }
                })}
                autoComplete="off"
              />
              <label>New Password</label>
              {errors.password?.message && <p style={{ color: "red" }}>{errors.password.message}</p>}
            </div>

            <div className="input-field">
              <input type="password"    {...register("confirmPassword", {
                required: {
                  value: true, message: "Enter Password Again",
                },

                validate: (value) => {
                  const password = watch("password"); // Ensure it always watches latest password value
                  return value === password || "Passwords do not match";
                }


              })} autoComplete="off" />
              <label>Confirm New Password</label>
              {errors.confirmPassword?.message && <p style={{ color: "red" }}>{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit">Update</button>

          </form>
        </div>
      )}

    </div>
  )
}

export default ChangePassword

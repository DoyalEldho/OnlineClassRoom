import React, { useContext, useState } from 'react';
import './Register.css'; // Import the updated CSS file
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, deleteUser, sendEmailVerification, updateProfile } from 'firebase/auth';
import { firebaseContext } from '../Store/context';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader/Loader';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import Signup from './GoogleSignup/Signup';
import { toast } from 'react-hot-toast';


const Register = () => {


    const [isLoading, setIsLoading] = useState(false);
    const { db, auth } = useContext(firebaseContext)
     const navigate=useNavigate();

    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const onSubmit = async (data, e) => {

        try {
            e.preventDefault();

            // Sign Up Function
            createUserWithEmailAndPassword(auth, data.email, data.password)
                .then((userCredential) => {
                    const userDetails = userCredential.user;
                    //   console.log(userDetails);

                    // Send verification email
                    sendEmailVerification(userDetails);
                    toast.success("Verification email sent! Please check your inbox.", {
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

                    setIsLoading(true);

                    //reload data and check for 2 minute and if not delete acc
                     let attempts=0;
                     
                     const checkVerification = async () => {
                         await userDetails.reload(); // Refresh user data
                         if (userDetails.emailVerified) {
                             updateProfile(userDetails, { displayName: data.name });
                             await addDoc(collection(db, "users"),{ id:userDetails.uid ,user:data.name,role:data.date,curDate:serverTimestamp() } )                   
                             toast.success("Email verified successfully!")

                             setIsLoading(false);
                             navigate("/login", { replace: true })
                             
                            } else {
                                attempts++;
                                if (attempts < 50) {
                                    setTimeout(checkVerification, 9000); // Recheck every 9 sec 
                                } else {
                                    setIsLoading(false);
                                    
                                    toast.error("Email not verified in time. Try again later.")
                                    await deleteUser(userDetails);
                                }
                            }
                        };
                        checkVerification();

                    
                })

        } catch (error) {
            console.log(error.message);

        }

    }

    return (
        <div className="register-container">
            {isLoading?(
               <Loader/>
            ):(
                     
                <div className="register-box">
                <h2>Register</h2>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="input-field">
                        <input type="text"   {...register("name",
                            {
                                required: { value: true, message: "Name is required" },

                                setValueAs: (value) => value.charAt(0).toLowerCase() + value.slice(1)
                            }
                        )} autoComplete="off" />

                        <label>Username</label>
                        {errors.name?.message && <p style={{ color: "red" }}>{errors.name.message}</p>}
                    </div>

                    <div className="input-field">
                        <input type="email"    {...register("email",
                            {
                                required: { value: true, message: "Email is required" },
                                pattern: {

                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                    message: "Enter a valid email address"
                                }
                            }
                        )} autoComplete="off" />
                        <label>Email</label>
                        {errors.email?.message && <p style={{ color: "red" }}>{errors.email.message}</p>}
                      </div>

                            <div className="input-field">
                                <input
                                    type="text"
                                    {...register("date", {
                                        required: { value: true, message: "Role is required" },
                                    })}
                                    onInput={(e) => e.target.value = e.target.value.toLowerCase()}
                                />
                                <label className="dob-label">Role</label>
                                {errors.date?.message && <p style={{ color: "red" }}>{errors.date.message}</p>}
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
                        <label>Password</label>
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
                        <label>Confirm Password</label>
                        {errors.confirmPassword?.message && <p style={{ color: "red" }}>{errors.confirmPassword.message}</p>}
                    </div>

                    <button type="submit">Register</button>
                    
                   <Signup/>
                    <p style={{color:"#fff"}}>Have an account? <span style={{color:"blue",cursor:'pointer'}}  onClick={()=>navigate("/login")}>Login</span></p>
                   
                </form>
            </div>
            )}
         
        </div>
    );
};

export default Register;

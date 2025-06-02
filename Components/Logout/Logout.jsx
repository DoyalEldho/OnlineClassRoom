import { signOut } from 'firebase/auth'
import React, { useEffect } from 'react'
import { auth } from '../../Firebase/config'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
const navigate=useNavigate();

    useEffect(()=>{
      
        signOut(auth);
        navigate('/login');

    },[])
  return (
    <div>
      
    </div>
  )
}

export default Logout

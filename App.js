
import './App.css';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import RegisterForm from './Pages/RegisterForm';
import { Route, Routes, useNavigate } from 'react-router-dom'
import ResetPassword from './Pages/ResetPassword';
import { useEffect, useState } from 'react';
import Loader from './Components/Loader/Loader';
import { auth, db } from './Firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import LogoutPage from './Pages/LogoutPage';
import AccountPage from './Pages/AccountPage';
import ChangePasswordPage from './Pages/ChangePasswordPage';
import StoryPage from './Pages/StoryPage';
import AllFriendsPage from './Pages/AllFriendsPage';
import FriendRequestPage from './Pages/FriendRequestPage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import LiveClassPage from './Pages/LiveClassPage';
import UploadVideoPage from './Pages/UploadVideoPage';
import { Toaster } from 'react-hot-toast';


function App() {

  const [isLoading, setIsLoading] = useState(true);
  const [messageNo ,setMessageNo]=useState("");
  const [role,setRole]=useState("");
  const navigate=useNavigate();

  useEffect(()=>{
       // check if user exist
       onAuthStateChanged(auth, async(user) =>{
 
        if(!user) return navigate("/login");
        console.log(user.displayName || user.email );
        const id =user.uid
        await fecthRole(id);

      })
      
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
     
  },[])

  useEffect(() => {
    const fetchMessageCount=async()=>{
      try {
        const id =auth.currentUser.uid
        await fecthRole(id);
        const q = query(
          collection(db, "friend_request"),
          where("receiverID", "==", auth.currentUser.uid),
          where("status", "==", "pending")
        );
  
         const messageList = await getDocs(q);
          setMessageNo(messageList.size)
           
      } catch (error) {
        console.log(error.message);
        
      }
  }
  fetchMessageCount();
 
  }, [navigate]);


  const fecthRole=async(uid)=>{
    
    const q = query(collection(db, "users"), where("id", "==", uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; 
      const userData = userDoc.data();
   
       if(userData.role){
        setRole(userData.role);
       }
       else{
        setRole("other");
       }   
    }
  }

  return (
    <div className="App">
      {isLoading ? (
        <div className='loader'><Loader /></div>

      ) : (
        <>
           <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path='/register' element={<RegisterForm />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/' element={<HomePage messageNo={messageNo} role={role} />} />
          <Route path='/resetPassword' element={<ResetPassword />} />
          <Route path='/logout' element={< LogoutPage/>} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/changePasswordAccount" element={<ChangePasswordPage />} />
           <Route path="/story" element={<StoryPage/>}  />
          <Route path="/allFriends" element={<AllFriendsPage/>} />
          <Route path="/friendRequest" element={<FriendRequestPage/>} />
          <Route path="/class" element={<LiveClassPage/>}/>
          <Route path="/upload" element={<UploadVideoPage/>}/>
         
       
        </Routes>
        </>
      )

      }

    </div>
  );
}

export default App;

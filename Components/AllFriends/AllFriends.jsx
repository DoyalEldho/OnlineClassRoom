import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "../../Firebase/config";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, getDocs, query, where, serverTimestamp, updateDoc, doc, arrayRemove, deleteDoc } from "firebase/firestore";
import Loader from "../Loader/Loader";
import "./AllFriends.css";
import { toast } from 'react-hot-toast';

const AllFriends = () => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendRequests, setFriendRequests] = useState({}); // Stores requested friend IDs as an array
  const [acceptedFriends, setAcceptedFriends] = useState({}); // Stores accepted friend IDs as an array
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSearchUser,setFilteredSearchUser]=useState("");
  const inputRef =useRef(null);


  useEffect(() => {
    if (!auth.currentUser) return navigate("/login");

    //cursor blink on input
    inputRef.current.focus();

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs
          .map(user => ({ id: user.id, ...user.data() }))
          .filter(user => user.id !== auth.currentUser?.uid); //filtering to get users other than loggedusers
        
          if(usersData){
            setAllUsers(usersData);
            setFilteredSearchUser(usersData) //contain all data first before searching
            await checkFriendRequests(usersData); //fn calling
          }
          else{
            setLoading(false);
            return;
          }
  
        setLoading(false);

      } catch (error) {
        console.error("Error fetching users:", error.message);
        setLoading(false);
      }
    };

    //fn declaration
    const checkFriendRequests = async (users) => {
      try {
        let requestStatus = {};
        let acceptedStatus = {};

        for (let user of users) {
          // Check for pending friend requests
          const requestQuery = query(collection(db, "friend_request"),
            where("status", "==", "pending"),
            where("receiverID", "==", user.id),
            where("senderID", "==", auth.currentUser.uid)
          );
          const requestSnapshot = await getDocs(requestQuery);
          if (!requestSnapshot.empty) {
            requestStatus[user.id] = true;
          }

          // Check for accepted friends
          //receiver vs sender friends page following showing code, "in" used to match user.id or auth.currentUser.uid in reciver or sender page    
          const acceptedQuery = query(collection(db, "friend_request"),
            where("status", "==", "accepted"),
            where("receiverID", "in", [auth.currentUser.uid, user.id]), //check in db if receiver id matches with currentUser.uid id or user.id
            where("senderID", "in", [auth.currentUser.uid, user.id])
          );
          const acceptedSnapshot = await getDocs(acceptedQuery);
          if (!acceptedSnapshot.empty){ 
            acceptedStatus[user.id] = true;
          }
        }
        setFriendRequests(requestStatus);
        setAcceptedFriends(acceptedStatus);
        setLoading(false);

      } catch (error) {
        console.error("Error checking friend requests:", error.message);
      }
    };

    fetchUsers();
  }, []);

  const addFriendRequest = async (receiverID,receiverName) => {
    try {
      if (!receiverID) {
        console.log("Something went wrong. Try again later.");
        return;
      }

      await addDoc(collection(db, "friend_request"), {
        senderID: auth.currentUser.uid,
        receiverID:receiverID,
        name:auth.currentUser.displayName,
        imageUrl:auth.currentUser.photoURL,
        status: "pending",
        createdAt: serverTimestamp(),
      });

    
      toast.success(`Friend request sent to ${receiverName}`, {
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

      setFriendRequests(prev => ({ ...prev, [receiverID]: true }));

    } catch (error) {
      console.error("Error sending friend request:", error.message);
    }
  };


   //search function
   const handleSearch=(e)=>{
      
      const searchValue =e.target.value.toLowerCase();
      setSearchTerm(searchValue);

      // filtering using allUsers that contain all users data not from filteredSearchUser which also contain all data initially  like said in medium
      if(searchValue===""){

        setFilteredSearchUser(allUsers);
      } 
      else{
        const filtered = allUsers.filter(user =>
          user.user.toLowerCase().includes(searchValue)
        );
        setFilteredSearchUser(filtered);
  
      }

   }

   //unfollow code
   const unfollow=async(friendUser,currentUser)=>{
    setLoading(true);
  
    // deleting friend_request field with doc_id
    const acceptedQuery = query(collection(db, "friend_request"),
    where("status", "==", "accepted"),
    where("receiverID", "in", [currentUser,friendUser]), //check in db if receiver id matches with currentUser.uid id or user.id
    where("senderID", "in", [currentUser,friendUser])
  );
  const acceptedSnapshot = await getDocs(acceptedQuery); 
  if(!acceptedSnapshot.empty){
         
    acceptedSnapshot.forEach(async (element) => {
        // console.log(element.id);
        await deleteDoc(doc(db, "friend_request", element.id))
    });
  }
  setAcceptedFriends(prev => ({ ...prev, [friendUser]: false })); //make id false to make following add friend

  // deleting story field using doc_id case1
     const storyQuery =query(collection(db,"story"),
      where ("userId","==",currentUser),
      where("viewerIds", "array-contains", friendUser)
    );
    const storyId = await getDocs(storyQuery); 

    if(!storyId.empty){
      storyId.docs.forEach(async(element)=>{
        const docRef = doc(db, "story", element.id); //get document id in element.id   
        await updateDoc(docRef,{
          viewerIds:arrayRemove(friendUser) 
        })
      })
    }

  
    
  // deleting story field using doc_id case2 
     const storyQuery2 =query(collection(db,"story"),
      where ("userId","==",friendUser),
      where("viewerIds", "array-contains", currentUser)
    );
    const storyId2 = await getDocs(storyQuery2); 

    if(!storyId2.empty){
      storyId2.docs.forEach(async(element)=>{
        const docRef = doc(db, "story", element.id); //get document id in element.id   
        await updateDoc(docRef,{
          viewerIds:arrayRemove(currentUser) 
        })
      })
    }

  
    
    //for post case 1 removing viewer friendUser
    const postQuery =query(collection(db,"posts"),
    where ("userId","==",currentUser),
    where("viewerIds", "array-contains",friendUser)
  );
  const postsId = await getDocs(postQuery); 

  if(!postsId.empty){
    postsId.docs.forEach(async(element)=>{
      const docRef = doc(db, "posts", element.id); //get document id in element.id   
      await updateDoc(docRef,{
        viewerIds:arrayRemove(friendUser) 
      })
    });
  }



    //for post case 2 removing viewer currentUser
    const postQuery2 =query(collection(db,"posts"),
    where ("userId","==",friendUser),
    where("viewerIds", "array-contains",currentUser)
  );
  const postsId2 = await getDocs(postQuery2); 

  if(!postsId2.empty){
  postsId2.docs.forEach(async(element)=>{
    const docRef = doc(db, "posts", element.id); //get document id in element.id   
    await updateDoc(docRef,{
      viewerIds:arrayRemove(currentUser) 
    })
  })
  }


  setLoading(false);
   }

  return (
    <div className="all-friends-container">
      <h3 style={{ textAlign: "center", marginTop: "20px",textDecoration:"underline",textUnderlineOffset:"5px",textDecorationColor:"gold",textDecorationThickness:"5px" }}>All Friends</h3>


     {/* search bar */}
       <div className="parent-container">
       <input
        type="text"
        ref={inputRef} 
        placeholder="Search friends..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
       </div>
    
      
      {loading ? (
        <div className="loader-container">
          <Loader className="loaders" />
        </div>
      ) : filteredSearchUser.length > 0 ? (
        filteredSearchUser.map((user) => (
          <div key={user.id} className="friend-request">
            <div className="request-content">
              <img src={user.imageUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJizcjGFENRhxpe0e_yrsCJ0jIR9qTj7jp6A&s" } alt={user.user} className="profile-pic" />
              <div className="user-info">
                <p className="user-name"><b>{user.user}</b></p>
              </div>

              <div className="action-buttons">
                {acceptedFriends[user.id] ? (
                  <button className="btn confirm" style={{ color: "white", background: "grey" }} onClick={()=>unfollow(user.id,auth.currentUser.uid)}>
                    Following
                  </button>
                ) : (
                  <button className="btn confirm" disabled={friendRequests[user.id]}
                    onClick={() => addFriendRequest(user.id,user.user)}>
                    {friendRequests[user.id] ? "Requested" : "Add Friend"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
                 <h3 className="not-found-message">{searchTerm} user not found</h3>
  
                )}
    </div>
  );
};

export default AllFriends;

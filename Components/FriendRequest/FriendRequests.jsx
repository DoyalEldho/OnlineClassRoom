import React, { useEffect, useState } from "react";
import { auth, db } from "../../Firebase/config";
import {  arrayUnion, collection, doc, getDocs, query, runTransaction, where } from "firebase/firestore";
import "./index.css";
import Loader from "../Loader/Loader";

const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]); // Store friend requests
  const [loading,setLoading] =useState(false);
  const [following,setFollowing]=useState({});

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchFriendRequests = async () => {
       setLoading(true);
      try {
        const requestQuery = query(
          collection(db, "friend_request"),
          where("status", "==", "pending"),
          where("receiverID", "==", auth.currentUser.uid)
        );

        const requestSnapshot = await getDocs(requestQuery);
        const requests = requestSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFriendRequests(requests); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching friend requests:", error.message);
        setLoading(false);
      }
    };

    fetchFriendRequests();
  }, []);

  const confirmRequest=async(request)=>{
         
    try {
       
      let followedOnes ={};
      setLoading(true);
      //update friend_request status =="accepted"
      //add viewerId and userId to db story & posts , viewerId like an array 
    
      if(!request){
        return;
      }

      const updateQuery =doc(db,"friend_request",request.id);
      const userStory = doc(db, "story", auth.currentUser.uid) 
      const userStory2 = doc(db,"story",request.senderID);
      // const userPost = doc(db, "posts", auth.currentUser.uid)
      // const userPost2 = doc(db,"posts",request.senderID);
      
      //Transaction used to prevent race condtion also Prevents conflicts when multiple users update the same data.
        await runTransaction(db,async(transaction)=>{

          const userStoryExist =await transaction.get(userStory); //check if userStory exist
          const userStoryExist2 =await transaction.get(userStory2); //check if userStory2 exist
          // const userPostExist =await transaction.get(userPost); //check if userPost exist
          // const userPostExist2 =await transaction.get(userPost2); //check if userPost exist
          
             // Update friend request status
          transaction.update(updateQuery,{status:"accepted"});
           followedOnes[request.senderID]=true;

           // for story ,if exist add viewerId
          if (userStoryExist.exists()) {
               transaction.update(userStory, { viewerIds: arrayUnion(request.senderID) });
          }
          // not exist create db posts and add viewerId
          else {
            transaction.set(userStory, { viewerIds: [request.senderID], userId: auth.currentUser.uid });
          }

          if(userStoryExist2.exists()){
            transaction.update(userStory2, { viewerIds: arrayUnion(request.receiverID) });
          }
          else{
            transaction.set(userStory2, { viewerIds: [request.receiverID], userId: request.senderID });
          }

          // for post,if exist add viewerId
          // if (userPostExist.exists()) {
          // transaction.update(userPost, { viewerIds: arrayUnion(request.senderID) });
          // }
          // // not exist create db posts and add viewerId
          // else {
          //   transaction.set(userPost, { viewerIds: [request.senderID], userId: auth.currentUser.uid });
          // }

          // if(userPostExist2.exists()){
          //   transaction.update(userPost2, { viewerIds: arrayUnion(request.receiverID) });
          // }
          // else{
          //   transaction.set(userPost2, { viewerIds: [request.receiverID], userId: request.senderID });
          // }
          
        })

        // outside transaction block
        setFollowing((prevFollwowingOnes)=>({
          ...prevFollwowingOnes ,[request.senderID]:true
        })); //request is confirm
  
        setLoading(false);

    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <h3 style={{ textAlign: "center", marginTop: "20px",textDecoration:"underline",textUnderlineOffset:"6px",textDecorationColor:"gold",textDecorationThickness:"5px"  }}>All Requests</h3>
      {loading ? (
        <div className="loader-container">
          <Loader/> 
        </div>
      ) : friendRequests.length > 0 ? (
        friendRequests.map((request) => (
          <div key={request.id} className="friend-request">
            <div className="request-header">
              <p>
                <b>Friend Request</b>
              </p>
            </div>

            <div className="request-content">
              <img
                src={request.imageUrl}
                alt={request.name}
                className="profile-pic"
              />
              <div className="user-info">
                <p className="user-name">
                  <b>{request.name}</b>
                </p>
              </div>

              <div className="action-buttons">
                {following[request.senderID]?(
                         
                         <button className="btn confirm" disabled >Following</button>   
                ):(
                  <>
                  <button className="btn confirm"  onClick={()=>confirmRequest(request)}>Confirm</button>
                  </>
                )}
               
              </div>
            </div>
          </div>
        ))
      ) : (
        <h1 style={{ textAlign: "center", marginTop: "100px" }}>
          No Friend Requests
        </h1>
      )}
    </div>
  );
};

export default FriendRequests;

import React, { useEffect, useState } from "react";
import "./Homepage.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaSignOutAlt, FaFire, FaCircleNotch, FaUserFriends } from "react-icons/fa";
import { SlCamrecorder } from "react-icons/sl";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../Firebase/config";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import DashBoard from "../SchedularDashboard.jsx/DashBoard";
import { GrAnnounce } from "react-icons/gr";

const Homepage = ({ messageNo, role }) => {

  const [timing, setTiming] = useState([]);
  const [viewer, setViewer] = useState(false);
  const [loader, setLoader] = useState(false);
  const [videos, setVideos] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [schedular, setSchedular] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    const fetchSchedule = async () => {

      try {

        if (!auth.currentUser.uid) return navigate('/login');

        setLoader(true);
        // db,"story","doc_id not selected" so get all viewerId from every documentID out of infinite records
        const viewerQuery = query(collection(db, "story"),
          where("viewerIds", "array-contains", auth.currentUser.uid)
        )

        const viewerList = await getDocs(viewerQuery);
        if (!viewerList.empty) {
          setViewer(true);

          // find uploaderId from viewerId story db
          const storyRef = doc(db, "story", auth.currentUser.uid);
          const storySnap = await getDoc(storyRef);
          if (storySnap.exists()) {
            const viewerIdsList = storySnap.data().viewerIds;

            // find story upload by uploader using id
            const scheduleQuery = await getDocs(collection(db, "schedule"));
            const scheduleData = scheduleQuery.docs.map((doc) => ({
              id: doc.id, ...doc.data()
            }))
              .filter((item) => viewerIdsList.includes(item.schedularId) || item.schedularId === auth.currentUser.uid);

            // console.log(scheduleData);
            setTiming(scheduleData);
            setLoader(false);
          }
        }
        else {
          setViewer(false);
          setLoader(false);
        }


      } catch (error) {
        setLoader(false);
        console.log(error);

      }
    }
    const fetchUserRole = async () => {

      // video fetching for user, role field in user === title of video
      const userRef = collection(db, "users");
      const userSnap = await getDocs(query(userRef, where("id", "==", auth.currentUser.uid)));
      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        setUserRole(userData.role);

        if (userData.role === "schedular") {
          setSchedular(true);
        }
      }
    };

    setLoader(false);
    fetchSchedule();
    fetchUserRole();


    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [])

  useEffect(() => {
    const fetchVideos = async () => {

      if (!userRole) return;

      const videosRef = collection(db, "videos");
      const q = query(videosRef, where("title", "==", userRole));
      const videoSnap = await getDocs(q);

      // finding uploaderId,if it there in story then show recording or else not show recording.request & accept first
      const uploaderIds = videoSnap.docs.map(doc => doc.data().uploaderId);
      // console.log("Uploader IDs:", uploaderIds[0]);

      // checking in story db,if shcedular accept then show recordings
      const storyRef = doc(db, "story", auth.currentUser.uid);
      const storySnap = await getDoc(storyRef);

      if (storySnap.exists()) {
        const viewerIds = storySnap.data().viewerIds || [];

        if (viewerIds.includes(uploaderIds[0])) {
          const videoList = videoSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })); //then show all recordings
          setVideos(videoList);

        }
        else{
          return;
        }

      }
      };
      fetchVideos();
    }, [userRole])

  const handleLogout = () => {
    sessionStorage.removeItem("roomName");
  }

  return (
    <div className="container">
      <h2 style={{ color: "gold", background: "black" }}><span><FaFire /></span>Infix</h2>
      {/* Sidebar */}
      <div className="sidebar">
        <h1 style={{ color: "gold" }}><span><FaFire /></span>Infix</h1>
        <ul>
          <li><Link to="/account"> <span><FaUser /> </span> Account</Link></li>
          {role === "schedular" && <li><Link to="/story"> <span><FaCircleNotch /> </span> schedule </Link></li>}
          <li><Link to="/allFriends"> <span><FaUserFriends /> </span>Friends</Link></li>
          <li><Link to="/friendRequest"> <span><FaUserFriends /></span>Requests    {messageNo > 0 && <span className="badge">{messageNo}</span>} </Link></li>
          {/* <li><Link to="/message"><span><FaEnvelope /></span>  Message</Link></li> */}
          <li><Link to="/class" onClick={handleLogout}><span><SlCamrecorder /> </span> Start live</Link></li>
          <li><Link to="/logout" onClick={handleLogout}> <span><FaSignOutAlt /></span>Logout</Link></li>
        </ul>
      </div>


      {loader ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="content">
          {/* Class Schedule Section */}
          <div className="class-schedule">
            <div className="scroll-text"> {/* array inside an array*/}
              {viewer && timing.length > 0 ? (
                timing.map((day) =>
                  day.timings.map((item, index) => (
                    <span key={index} className="class-time">
                      {item.subject} - &nbsp;
                      {item.from ? new Date(item.from.seconds * 1000).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Kolkata",
                      }) : ""}
                      {item.to ? new Date(item.to.seconds * 1000).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Kolkata",
                      }) : (<span  >
                        Announcement <GrAnnounce style={{ color: "red" }} />
                      </span>)}  {day.notification && <div className="notification-box"> {day.notification}</div>}
                    </span>

                  ))
                )
              ) : (
                <p>No classes schedule available</p>
              )}

            </div>

          </div>

          {/* video Section */}

          {schedular ? (
            <DashBoard />) : (
            <div className="record-video-section">
              <h4 className="section-heading">📹 Recordings</h4>

              {loader ? (
                <p>Loading videos...</p>
              ) : videos.length === 0 ? (
                <p style={{ textAlign: "center" }}>No videos available </p>
              ) : (
                <div className="video-gallery">
                  {videos.map((video) => (
                    <VideoPlayer
                      key={video.id}
                      videoUrl={video.videoUrl}
                      title={video.title}
                      description={video.description}
                      uploadedAt={video.uploadedAt}
                    />
                  ))}
                </div>
              )}
            </div>
          )}



        </div>
      )}



    </div>
  );
};

export default Homepage;

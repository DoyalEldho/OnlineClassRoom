import React, { useEffect, useRef, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { FaCopy } from "react-icons/fa";
import './Class.css';
import { ImExit } from "react-icons/im";
import { useNavigate } from 'react-router-dom';
import { IoVideocam, IoVideocamOff } from "react-icons/io5";
import { MdFileUpload } from "react-icons/md";
import { toast } from 'react-hot-toast';


const Class = () => {


  const [copySuccess, setCopySuccess] = useState(false);
  const [roomId,setRoomId]=useState("");
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null); //to store record video
  const navigate =useNavigate(); 

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  useEffect(()=>{

    let getRoomId = sessionStorage.getItem("roomName");
    
    if(!getRoomId){
      getRoomId = `Class_${Date.now()}`; //unique room 
      sessionStorage.setItem("roomName",getRoomId);
    }
    setRoomId(getRoomId);
    

  
  },[])

 const roomURL = `https://meet.jit.si/${roomId}`;

  const copyToClipboard = (event) => {
    event.preventDefault(); 
    navigator.clipboard.writeText(roomURL);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const exit=()=>{
    navigate("/")
  }

  const startRecording = async () => {
    try {
      // Capture screen video
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: { echoCancellation: true, noiseSuppression: true }
      });
  
      // Capture microphone audio
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
      // Merge both audio streams
      const mixedAudioStream = new MediaStream([
        ...screenStream.getAudioTracks(),
        ...micStream.getAudioTracks()
      ]);
  
      // Merge screen & audio streams
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...mixedAudioStream.getAudioTracks()
      ]);
  
      mediaRecorderRef.current = new MediaRecorder(combinedStream);
  
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
  
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        setVideoBlob(blob);
        recordedChunksRef.current = [];
  
        // Download recorded video
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Class_Recording_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
  
      mediaRecorderRef.current.start();
      console.log("rec started");
      
      setRecording(true);
    } catch (error) {
      toast.error("please check if microphone turned on")
      console.error("Error starting recording:", error);
    }
  };
  

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      console.log("recording stoped");
      
      setRecording(false);
    }
  };

  const handleUpload=()=>{
    navigate("/upload");
  }


  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, width: "100%" }}> 
        
        <JitsiMeeting
           domain="meet.jit.si"
          roomName={roomId}
          configOverwrite={{
            startWithAudioMuted: true,
            startWithVideoMuted: true,
          }}
          
          getIFrameRef={(iframe) => {
            iframe.style.height = "100%";
            iframe.style.width = "100%";
          }}
          />
      </div>
      {/* link */}
      <div className="link-container">
      <div className="link-row">
        <p style={{marginLeft:"30%"}}>{copySuccess && <p style={{ color: "green" }}>Link Copied!</p>}</p>
        <span className="class-link"> <span className='link-head'>Meeting Link -</span>  {roomURL}</span>
          <span className='copy-icon'> <FaCopy  onClick={copyToClipboard} /></span>   
          <span style={{position: "absolute", right: "10%",color:"red",cursor:"pointer"}} className='exit-btn' onClick={exit}><ImExit /> Exit</span>

          <span onClick={recording ? stopRecording : startRecording}  className={recording?"record-stop-btn":"record-btn" }>
          {recording ? <IoVideocamOff /> : <IoVideocam />} {recording ? "Stop Recording" : "Start Recording"}
        </span>

         <span onClick={handleUpload} className='upload-class'><MdFileUpload/>UPLOAD</span>
      </div>
      </div>
    </div>
  );
};

export default Class;

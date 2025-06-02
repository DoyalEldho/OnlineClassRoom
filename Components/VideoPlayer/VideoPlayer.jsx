import React, { useEffect } from "react";
import "./VideoPlayer.css"; // Styles for the player

const VideoPlayer = ({ videoUrl, title, description, uploadedAt }) => {
  useEffect(() => {
    // Disable Right-Click
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  return (
    <div className="video-container">
      <h4 className="video-title">{title}</h4>
      <p className="video-description">{description}</p>
      <p className="video-time">
        Uploaded on: {uploadedAt ? new Date(uploadedAt.seconds * 1000).toLocaleString() : "Unknown"}
      </p>

      <div className="video-wrapper">
        <video controlsList="nodownload" controls disablePictureInPicture>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;

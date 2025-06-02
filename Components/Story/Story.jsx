import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Story.css";
import { auth, db } from "../../Firebase/config";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';

const Story = () => {
  const today = new Date();
  const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

  // State for class timings
  const [classTimings, setClassTimings] = useState([
    { subject: "", from: null, to: null, enabled: true },
  ]);
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  // Add new class timing entry
  const addClassTiming = () => {
    setClassTimings((prev) => [
      ...prev,
      { subject: "", from: null, to: null},
    ]);
  };

  // Update class timing inputs
  const updateClassTiming = (index, field, value) => {
    setClassTimings((prev) => {
      const updatedTimings = [...prev];
      updatedTimings[index][field] = value;
      return updatedTimings;
    });
  };

  // Submit schedule to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();

    const scheduleRef = doc(db, "schedule", auth.currentUser.uid);
    const scheduleData = {
      schedularId: auth.currentUser.uid,
      date: formattedDate,
      timings: classTimings,
      notification: notification.trim() || null,
      createdAt: new Date(),
    };
    // setDoc will create or update the document at the given ID
    await setDoc(scheduleRef, scheduleData, { merge: true });

    toast.success("Schedule updated!")
    setClassTimings([{ subject: "", from: null, to: null}]);
    setNotification("");
    navigate("/");
  };

  return (
    <div className="story-wrapper">
    <div className="schedule-container">
      <h4>Class Schedule for {formattedDate}</h4>
      <form onSubmit={handleSubmit}>

      <div className="notification-section">
          <input
            type="text"
            placeholder="Important Notification"
            value={notification}
            onChange={(e) => setNotification(e.target.value)}
          />
        </div>

        {/* Class Timings Input Fields */}
        <div className="timing-section">
          {classTimings.map((timing, index) => (
            <div key={index} className="timing-row">
              <input
                type="text"
                placeholder="Subject"
                value={timing.subject}
                onChange={(e) => updateClassTiming(index, "subject", e.target.value)}
            
              />
              <DatePicker
                selected={timing.from}
                onChange={(date) => updateClassTiming(index, "from", date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15} // Adjust interval as needed
                timeCaption="Start"
                dateFormat="h:mm aa" // 12-hour AM/PM format
                placeholderText="From"
                
              />
              <span>to</span>
              <DatePicker
                selected={timing.to}
                onChange={(date) => updateClassTiming(index, "to", date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="End Time"
                dateFormat="h:mm aa"
                placeholderText="To"
                
              />
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addClassTiming}>
            + Add Class
          </button>
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
    </div>
  );
};

export default Story;

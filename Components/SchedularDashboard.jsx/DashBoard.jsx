import React, { useState, useEffect } from 'react';
import { db } from '../../Firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './DashBoard.css'; 
import { toast } from 'react-hot-toast';


const DashBoard = () => {
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    batch: '',
    id: '',
    from: '',
    to: ''
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const querySnapshot = await getDocs(collection(db, 'schedular_dashboard'));
    const scheduleData = querySnapshot.docs.map(doc => ({
      docId: doc.id,
      ...doc.data()
    }));
    setSchedules(scheduleData);
  };

  const handleChange = (e) => {
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.title || !newSchedule.batch || !newSchedule.from || !newSchedule.to) {
      toast.error('Please fill all fields')
      return;
    }

    const newEntry = {
      title: newSchedule.title,
      batch: newSchedule.batch,
      id: newSchedule.id || Date.now().toString(),
      timings: [{
        subject: newSchedule.title,
        from: new Date(`1970-01-01T${newSchedule.from}:00Z`),
        to: new Date(`1970-01-01T${newSchedule.to}:00Z`)
      }]
    };

    await addDoc(collection(db, 'schedular_dashboard'), newEntry);
    setNewSchedule({ title: '', batch: '', id: '', from: '', to: '' });
    fetchSchedules();
  };

  const handleDelete = async (docId) => {
    await deleteDoc(doc(db, 'schedular_dashboard', docId));
    fetchSchedules();
  };

  return (
    <div className="schedule-manager">
      <h4>📅 Class Time Manager</h4>

      <div className="form-row">
        <input type="text" name="title" value={newSchedule.title} placeholder="course" onChange={handleChange} />
        <input type="text" name="batch" value={newSchedule.batch} placeholder="Batch" onChange={handleChange} />
        <input type="text" name="id" value={newSchedule.id} placeholder="title&Id" onChange={handleChange} />
        <input type="time" name="from" value={newSchedule.from} onChange={handleChange} />
        <input type="time" name="to" value={newSchedule.to} onChange={handleChange} />
        <button className='add-btn' onClick={handleAddSchedule}>Add Schedule</button>
      </div>

      <div className="schedule-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Batch</th>
              <th>ID</th>
              <th>From</th>
              <th>To</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((item, index) => (
              <tr key={index}>
                <td>{item.title}</td>
                <td>{item.batch}</td>
                <td>{item.id}</td>
                <td>{item.timings?.[0] && new Date(item.timings[0].from.seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
               <td>{item.timings?.[0] && new Date(item.timings[0].to.seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                <td><button style={{background:"#ff4d4d"}} onClick={() => handleDelete(item.docId)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashBoard;

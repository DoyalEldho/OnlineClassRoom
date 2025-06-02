## Project Title & Description
   # Live Meeting + Recording + Uploading in a web app
  This React Firebase app enables users to join live meetings, record sessions, and upload recordings using Firebase and Jitsi Meet.Students can get the class recording once they request 
  and follow the coressponding teacher

## Features 
- Live meetings with Jitsi Meet
- Session recording and upload to Firebase Storage and cloudinary
- User authentication with Firebase
- Responsive UI (in progress)

## Setup Instructions

1. Clone the repo:

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo

2.Install dependencies:npm install

3. Configure Firebase:

    Create a Firebase project at Firebase Console

    Add a web app and get your config keys

    Create src/firebase/config.js with your Firebase config

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export default firebaseConfig;

4.Start the app:npm start
Open http://localhost:3000 in your browser.

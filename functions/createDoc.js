const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin
initializeApp({
  projectId: "campus-hive-ea5cf", // Emulator Project ID
});

const db = getFirestore();

// Connect to Firestore Emulator
db.settings({
  host: "localhost:8080", // Default emulator port (adjust if needed)
  ssl: false, // Emulator uses insecure connection
});

// Create document
const createActivityDoc = async () => {
  const activitiesRef = db.collection("activities");
  const newDocRef = activitiesRef.doc(); // Auto-generated ID

  await newDocRef.set({
    location: {
      zip: "95060",
    },
  });

  console.log("Document created:", newDocRef.id);
};

createActivityDoc();

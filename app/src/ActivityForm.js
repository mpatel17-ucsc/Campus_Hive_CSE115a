// import React, { useState } from "react";
// import { doc, setDoc, serverTimestamp } from "firebase/firestore";
// import { useNavigate } from "react-router-dom";
// import { db } from "./Firebase";
//
// const ActivityForm = () => {
//   const [placeName, setPlaceName] = useState("");
//   const [city, setCity] = useState("");
//   const [state, setState] = useState("");
//   const [rating, setRating] = useState(0);
//   const [description, setDescription] = useState("");
//   const navigate = useNavigate();
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//
//     try {
//       await setDoc(doc(db, "activities", new Date().toISOString()), {
//         placeName,
//         city,
//         state,
//         rating,
//         description,
//         createdAt: serverTimestamp(),
//       });
//
//       alert("Activity posted successfully!");
//       navigate("/home");
//     } catch (error) {
//       console.error("Error posting activity:", error);
//     }
//   };
//
//   return (
//     <div
//       style={{
//         maxWidth: "500px",
//         margin: "50px auto",
//         padding: "20px",
//         border: "1px solid #ccc",
//         borderRadius: "8px",
//       }}
//     >
//       <h2>Create an Activity Post</h2>
//       <form onSubmit={handleSubmit}>
//         <div style={{ marginBottom: "10px" }}>
//           <label>Place Name:</label>
//           <input
//             type="text"
//             value={placeName}
//             onChange={(e) => setPlaceName(e.target.value)}
//             required
//           />
//         </div>
//         <div style={{ marginBottom: "10px" }}>
//           <label>City:</label>
//           <input
//             type="text"
//             value={city}
//             onChange={(e) => setCity(e.target.value)}
//             required
//           />
//         </div>
//         <div style={{ marginBottom: "10px" }}>
//           <label>State:</label>
//           <input
//             type="text"
//             value={state}
//             onChange={(e) => setState(e.target.value)}
//             required
//           />
//         </div>
//         <div style={{ marginBottom: "10px" }}>
//           <label>Rating (out of 5 stars, increments of 0.5):</label>
//           <input
//             type="number"
//             step="0.5"
//             min="0"
//             max="5"
//             value={rating}
//             onChange={(e) => setRating(parseFloat(e.target.value))}
//             required
//           />
//         </div>
//         <div style={{ marginBottom: "10px" }}>
//           <label>Description:</label>
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           style={{
//             padding: "10px",
//             backgroundColor: "#3b82f6",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor: "pointer",
//           }}
//         >
//           Submit Activity
//         </button>
//       </form>
//       <button
//         onClick={() => navigate("/home")}
//         style={{
//           marginTop: "10px",
//           padding: "10px",
//           backgroundColor: "gray",
//           color: "white",
//           border: "none",
//           borderRadius: "4px",
//           cursor: "pointer",
//         }}
//       >
//         Cancel
//       </button>
//     </div>
//   );
// };
//
// export default ActivityForm;

import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "./Firebase";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";

const ActivityForm = () => {
  const [placeName, setPlaceName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await setDoc(doc(db, "activities", new Date().toISOString()), {
        placeName,
        city,
        state,
        description,
        createdAt: serverTimestamp(),
      });

      alert("Activity posted successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error posting activity:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{ padding: 3, marginTop: 5, borderRadius: 2, textAlign: "center" }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create an Activity Post
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Place Name"
            variant="outlined"
            fullWidth
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="City"
            variant="outlined"
            fullWidth
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="State"
            variant="outlined"
            fullWidth
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          {/* Submit and Cancel Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ width: "48%" }}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ width: "48%" }}
              onClick={() => navigate("/home")}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ActivityForm;

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { db, auth } from "../util/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const CommentsSection = ({ activityId }) => {
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    const commentsRef = collection(db, "activities", activityId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsList);
    });

    return () => unsubscribe();
  }, [activityId]);

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;

    try {
      const commentsRef = collection(db, "activities", activityId, "comments");
      await addDoc(commentsRef, {
        text: commentInput,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous",
      });
      setCommentInput("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Comments
      </Typography>

      {/* Scrollable comments container */}
      <Box
        sx={{
          maxHeight: 200, // Adjust this value as needed
          overflowY: "auto",
          mb: 2,
          pr: 1, // optional: provides some right padding for scrollbar space
          border: "1px solid #eee",
          borderRadius: "4px",
          p: 1,
        }}
      >
        <List>
          {comments.map((comment) => (
            <ListItem key={comment.id} alignItems="flex-start" disableGutters>
              <ListItemText
                primary={`${comment.userName}:`}
                secondary={comment.text}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Write a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddComment}>
          Post
        </Button>
      </Box>
    </Box>
  );
};

export default CommentsSection;


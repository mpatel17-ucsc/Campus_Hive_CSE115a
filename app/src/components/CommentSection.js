import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { db, auth } from "../util/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Delete, Edit } from "@mui/icons-material"

const CommentsSection = ({ activityId }) => {
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [users, setUsers] = useState([]);
  const [mentionMenuAnchor, setMentionMenuAnchor] = useState(null);
  // const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState([]);

  const fetchComments = async () => {
    const commentsRef = collection(db, "activities", activityId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsList);

      // Extract unique emails from comments
      const uniqueUsers = Array.from(
        new Set(commentsList.map((c) => c.userName || c.email)),
      );
      setUsers(uniqueUsers);
    });

    return () => unsubscribe();
  };

  // Ensure `fetchComments` runs when the component loads
  useEffect(() => {
    fetchComments();
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          email: doc.data().email, // Extract email instead of undefined userName
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCommentInput(value);

    const lastWord = value.split(" ").pop();

    if (lastWord.startsWith("@")) {
      const query = lastWord.slice(1).toLowerCase();

      if (!query) {
        setMentionResults(users.map((user) => user.email).filter(Boolean)); // Ensure valid emails
        setMentionMenuAnchor(e.currentTarget); // 🔥 Keep dropdown active
        return;
      }

      // setMentionQuery(query);
      setMentionResults(
        users
          .map((user) => user.email)
          .filter((email) => email && email.toLowerCase().startsWith(query)),
      );

      setMentionMenuAnchor(e.currentTarget); // Keeps dropdown properly positioned
    } else {
      setMentionResults([]);
      setMentionMenuAnchor(null);
    }
  };

  const handleMentionSelect = (username) => {
    // Replace @mention with actual username
    if (!username) return; // Prevent undefined selection
    const words = commentInput.split(" ");
    words[words.length - 1] = `@${username} `;
    setCommentInput(words.join(" "));
    setMentionResults([]);
    setMentionMenuAnchor(null);
  };

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
      window.location.reload(); // NOTE: THIS should be ideally replaced in the next sprint. When a user @ someone once, the page should not fully reload, and the user should be able to comment again using the @ feature.

      // Reset input and close mention dropdown
      setCommentInput("");
      setMentionResults([]);
      setMentionMenuAnchor(null); // This ensures you can use @ again
      // setMentionQuery(""); // Clear query to allow fresh mentions
      // Fetch comments again after posting to refresh UI
      fetchComments();
      // Restore focus to input field so @ can trigger the dropdown again
      setTimeout(() => document.getElementById("comment-input").focus(), 0);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, "activities", activityId, "comments", commentId));
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      const commentRef = doc(db, "activities", activityId, "comments", commentId);
      await updateDoc(commentRef, { text: newText });
      setEditCommentId(null); // Exit edit mode
      setEditCommentText(""); // Clear input
    } catch (error) {
      console.error("Error updating comment:", error);
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
          minHeight: 150, // Ensures the box doesn't shrink too much
          maxHeight: 200, // Limits excessive growth
          overflowY: "auto",
          mb: 2,
          pr: 1,
          border: "1px solid #ddd",
          borderRadius: "8px",
          p: 1,
          backgroundColor: "#fafafa",
        }}
      >
        <List>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <ListItem
                key={comment.id}
                alignItems="flex-start"
                disableGutters
                sx={{
                  display: "flex",
                  flexDirection: "column", // Stack comment text and buttons vertically
                  alignItems: "flex-start",
                  gap: 1, // Adds spacing
                }}
              >
                {/* Editable Comment */}
                {editCommentId === comment.id ? (
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleEditComment(comment.id, editCommentText);
                      }
                    }}
                  />
                ) : (
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold" component="span">
                        {comment.userName}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ pl: 2 }}>{comment.text}</Typography>
                    }
                  />
                )}
  
                {/* Edit & Delete Buttons (Only for Comment Owner) */}
                {auth.currentUser?.uid === comment.userId && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, }}>
                    {/* Edit Button */}
                    {editCommentId === comment.id ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleEditComment(comment.id, editCommentText)}
                      >
                        Save
                      </Button>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditCommentId(comment.id);
                          setEditCommentText(comment.text);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
  
                    {/* Delete Button */}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComment(comment.id)}
                      sx={{
                        "&:hover": {
                          color: "red",
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </ListItem>
            ))
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ py: 2 }}
            >
              No comments yet. Be the first to comment!
            </Typography>
          )}
        </List>
      </Box>
  
      {/* Input Field with Mention Suggestion */}
      <Box sx={{ display: "flex", gap: 1, position: "relative" }}>
        <TextField
          id="comment-input"
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Write a comment..."
          value={commentInput}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <Button variant="contained" onClick={handleAddComment}>
          Post
        </Button>
      </Box>
  
      {/* Mention Suggestions Menu */}
      <Menu
        anchorEl={mentionMenuAnchor}
        open={Boolean(mentionMenuAnchor) && mentionResults.length > 0}
        onClose={() => setMentionMenuAnchor(null)}
        autoFocus={false} // Prevents accidental close on first selection
      >
        {mentionResults.map((user) => (
          <MenuItem key={user} onClick={() => handleMentionSelect(user)}>
            {user}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}  

export default CommentsSection;

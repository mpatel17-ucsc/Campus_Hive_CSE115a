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
    // Reference to the "comments" subcollection inside the specified "activityId"
    const commentsRef = collection(db, "activities", activityId, "comments");
    // Create a query to order comments by creation timestamp in ascending order
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    // Listen for real-time updates in the comments collection
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Map through the retrieved documents and format them into an array of comment objects
      const commentsList = snapshot.docs.map((doc) => ({
        id: doc.id, // Store document ID for potential edits or deletions
        ...doc.data(), // Spread operator to include all comment fields (text, userId, userName, etc)
      }));
      // Update the state with the list of comments
      setComments(commentsList);

      // Extract unique emails from comments
      const uniqueUsers = Array.from(
        new Set(commentsList.map((c) => c.userName || c.email)), // Ensures only distinct users are stored
      );
      // Update the mention users state for autocomplete functionality
      setUsers(uniqueUsers);
    });
    // Return the unsubscribe function to clean up the listener when the component unmounts
    return () => unsubscribe();
  };

  // Ensure `fetchComments` runs when the component loads
  useEffect(() => {
    fetchComments();
  }, [activityId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch the "users" collection from Firestore
        const querySnapshot = await getDocs(collection(db, "users"));
        // Map through the documents and extract each user's ID and email
        const userList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          username: doc.data().username || null, // Ensure username exists
        }))
        .filter((user) => user.username !== null); // Remove users without a username
        // Update state with the list of users
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    // Invoke the async function immediately when the component mounts
    fetchUsers();
  }, []); // empty array to ennsure one run

  const handleInputChange = (e) => {
    // Get the current input value
    const value = e.target.value;
    setCommentInput(value);
    // Extract the last word the user typed (to check for mentions)
    const lastWord = value.split(" ").pop();
    // Check if the last word starts with '@' to trigger mention suggestions
    if (lastWord.startsWith("@")) {
      // Remove '@' and convert to lowercase for case-insensitive search
      const query = lastWord.slice(1).toLowerCase();

      if (!query) {
        // If only "@" is typed, show all available users
        setMentionResults(users.map((user) => user.username).filter(Boolean)); // Ensure valid usernames
        setMentionMenuAnchor(e.currentTarget); // Keep dropdown active
        return;
      }

      
    // Filter usernames based on input query
    const filteredUsers = users
      .map((user) => user.username)
      .filter((username) => username && username.toLowerCase().startsWith(query));

    setMentionResults(filteredUsers);

    if (filteredUsers.length > 0) {
      setMentionMenuAnchor(e.currentTarget);
    } else {
      setMentionMenuAnchor(null);
    }
  } else {
    setMentionResults([]);
    setMentionMenuAnchor(null);
  }
  };

  const handleMentionSelect = (username) => {
    // If username is undefined or null, exit early to avoid errors
    if (!username) return;
    // Split the comment input into an array of words
    const words = commentInput.split(" ");
    // Replace the last typed word (which started with @) with the selected username
    words[words.length - 1] = `@${username} `;
    // Update the comment input field with the modified text
    setCommentInput(words.join(" "));
    // Clear mention suggestions
    setMentionResults([]);
    setMentionMenuAnchor(null);
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    try {
      const commentsRef = collection(db, "activities", activityId, "comments");
      const newComment = {
        text: commentInput,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous",
      };
      const docRef = await addDoc(commentsRef, newComment);
  
      setComments([...comments, { id: docRef.id, ...newComment }]); // Append new comment to state
      window.location.reload()
      setCommentInput(""); // Clear input
      setMentionResults([]); // Clear mentions
      setMentionMenuAnchor(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  

  const handleDeleteComment = async (commentId) => {
    try {
      // Get a reference to the specific comment document in Firestore and fetch updated comments after deletion
      await deleteDoc(doc(db, "activities", activityId, "comments", commentId));
      fetchComments();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      // Get a reference to the specific comment document in Firestore
      const commentRef = doc(db, "activities", activityId, "comments", commentId);
      // Update the comment text in Firestore
      await updateDoc(commentRef, { text: newText });
      // Exit edit mode after updating the comment
      setEditCommentId(null);
      // Clear the temporary edit input field
      setEditCommentText("");
      // Fetch updated comments after editing (if not using page reload)
      fetchComments();
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
        {mentionResults.map((username) => (
          <MenuItem key={username} onClick={() => handleMentionSelect(username)}>
            @{username}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}  

export default CommentsSection;

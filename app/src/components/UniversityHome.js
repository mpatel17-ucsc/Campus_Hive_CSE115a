import React, { useState, useEffect, useRef } from "react";
import { TextField, MenuItem, Menu, ListItemText, Button} from "@mui/material";

const API_KEY = process.env.REACT_APP_COLLEGE_SCORECARD_API_KEY;

const UniversitySelector = ({ onSelectUniversity }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [anchorEl, setAnchorEl] = useState(null); // State to track the anchor element for Menu
  const inputRef = useRef(null); // Reference to the input field

  const handleClearUniversity = () => {
    setSelectedUniversity(""); // Clear selected university
    onSelectUniversity("");
  };

  useEffect(() => {
    const fetchUniversities = async () => {
      if (!searchTerm) {
        setUniversities([]);
        return;
      }
      const url = `https://api.data.gov/ed/collegescorecard/v1/schools.json?school.name=${searchTerm}&fields=school.name&api_key=${API_KEY}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setUniversities(data.results || []);
      } catch (error) {
        console.error("Error fetching universities:", error);
        setUniversities([]);
      }
    };
    fetchUniversities();
  }, [searchTerm]);

  const handleSelect = (university) => {
    setSearchTerm(university); 
    setSelectedUniversity(university);
    onSelectUniversity(university); // Pass the selection to parent component
    setAnchorEl(null); // Close the menu after selection
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget); // Open the menu when the input field is focused
  };

  const handleClose = () => {
    setAnchorEl(null); // Close the menu
  };

  return (
    <div>
      <TextField
        label="Search University"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClick={handleClick} // Open the menu on click
        inputRef={inputRef} // Attach ref to input field
        sx={{ mb: 2 }}
      />
      
      {/* Menu component for universities */}
      {searchTerm && universities.length > 0 && (
        <Menu
          anchorEl={anchorEl} // Anchor the menu to the input field
          open={Boolean(anchorEl)} // Open the menu when anchor is set
          onClose={handleClose} // Close the menu when clicked outside
          MenuListProps={{
            sx: {
              maxHeight: 300,
              overflow: 'auto',
              backgroundColor: 'white', // Solid background color
              zIndex: 9999, // Ensure the dropdown is on top
            },
          }}
        >
          {universities.map((university, index) => (
            <MenuItem
              key={index}
              onClick={() => handleSelect(university["school.name"])}
            >
              <ListItemText primary={university["school.name"]} />
            </MenuItem>
          ))}
        </Menu>
      )}
      <Button variant="outlined" color="secondary" onClick={handleClearUniversity}>
        Clear University
      </Button>
    </div>
  );
};

export default UniversitySelector;

// src/components/CallerDialog.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';

const CallerDetailsEdit = ({ open, caller, onClose, onSave }) => {
  const [callerDetails, setCallerDetails] = useState({
    name: '',
    title: '',
    business_type: '',
    company_name: '',
    company_size: '',
    hosting_needs: '',
    preferred_contact_method: '',
    notes: ''
  });

  useEffect(() => {
    if (caller) {
      setCallerDetails(caller);
    }
  }, [caller]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCallerDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(callerDetails);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Caller Details</DialogTitle>
      <DialogContent >
        <Box component="form" sx={{ '& .MuiTextField-root': { marginBottom: 2 } }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={callerDetails.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={callerDetails.title}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Business Type"
            name="business_type"
            value={callerDetails.business_type}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Company Name"
            name="company_name"
            value={callerDetails.company_name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Company Size"
            name="company_size"
            value={callerDetails.company_size}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Hosting Needs"
            name="hosting_needs"
            value={callerDetails.hosting_needs}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Preferred Contact Method"
            name="preferred_contact_method"
            value={callerDetails.preferred_contact_method}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            value={callerDetails.notes}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CallerDetailsEdit;

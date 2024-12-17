import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, IconButton, CardHeader } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CallerDetailsEdit from './CallerDetailsEdit';

const CallerDetails = ({ caller, setCallers }) => {
    const [showCallerDetailsEdit, setShowCallerDetailsEdit] = useState(false);
  if (!caller) {
    return <Typography variant="body2">No caller selected</Typography>;
  }

  const handleCallerSave = (updatedCaller) => {
    setCallers((prevCallers) =>
      prevCallers.map((caller) =>
        caller.callerId === updatedCaller.callerId ? updatedCaller : caller
      )
    );
  };
  
  return (
    <>
    <Card variant="outlined">
        <CardHeader
        action={
          <IconButton aria-label="Edit Caller" onClick={() => setShowCallerDetailsEdit(true)}>
            <EditIcon />
          </IconButton>
        }
        title={caller.name}
        subheader={caller.company_name}
      />
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="body2"><b>Industry:</b> {caller.business_type}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2"><b>Hosting Needs:</b> {caller.hosting_needs}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2"><b>Notes:</b> {caller.notes}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
    <CallerDetailsEdit
    open={showCallerDetailsEdit}
    caller={caller}
    onClose={() => setShowCallerDetailsEdit(false)}
    onSave={handleCallerSave}
  />
  </>
  );
};

export default CallerDetails;

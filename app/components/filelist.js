import React from 'react';
import { List, ListItem, Button, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FileList = ({ files, onRemoveFile }) => {
  return (
    <List>
      {files.map((file, index) => (
        <ListItem key={index}>
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ pr: 4, textAlign: 'left', textTransform: 'none' }}
            >
              {file.name}
            </Button>
            <IconButton
              size="small"
              sx={{ position: 'absolute', top: 4, right: 4 }}
              onClick={() => onRemoveFile(index)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default FileList;
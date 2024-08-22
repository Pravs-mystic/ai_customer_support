import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon, Collapse } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

export default function FileList({ files }) {
  const [openKBs, setOpenKBs] = React.useState({});

  const toggleKB = (kbId) => {
    setOpenKBs(prev => ({ ...prev, [kbId]: !prev[kbId] }));
  };

  // Group files by knowledge base
  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.knowledgeBaseId]) {
      acc[file.knowledgeBaseId] = {
        name: file.knowledgeBaseName,
        files: []
      };
    }
    acc[file.knowledgeBaseId].files.push(file);
    return acc;
  }, {});

  return (
    <List>
      {Object.entries(groupedFiles).map(([kbId, kb]) => (
        <React.Fragment key={kbId}>
          <ListItem button onClick={() => toggleKB(kbId)}>
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary={kb.name} />
            {openKBs[kbId] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openKBs[kbId]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {kb.files.map((file) => (
                <ListItem key={file.documentId} sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <InsertDriveFileIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={file.name} 
                    secondary={`${file.fileType} - ${(file.fileSize / 1024).toFixed(2)} KB`} 
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      ))}
    </List>
  );
}
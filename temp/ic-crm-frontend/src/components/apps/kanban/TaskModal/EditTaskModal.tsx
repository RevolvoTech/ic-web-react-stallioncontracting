import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import useSWR from 'swr';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { getFetcher } from 'src/api/globalFetcher';
import { crmSwrOptions } from 'src/lib/swrOptions';
import { fileToBase64 } from 'src/lib/fileToBase64';

function EditTaskModal({ show, onHide, editedTask, onSave }: any) {
  const { data: projectsData } = useSWR('/api/projects', getFetcher, crmSwrOptions);
  const [tempEditedTask, setTempEditedTask] = useState(editedTask);
  const [imagePreview, setImagePreview] = useState(editedTask?.taskImage || '');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setTempEditedTask({
      ...editedTask,
      taskImageFile: null,
      removeTaskImage: false,
    });
    setImagePreview(editedTask?.taskImage || '');
  }, [editedTask]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTempEditedTask({ ...tempEditedTask, [name]: value });
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingImage(true);
    try {
      const contentBase64 = await fileToBase64(file);
      const preview = `data:${file.type};base64,${contentBase64}`;
      setImagePreview(preview);
      setTempEditedTask({
        ...tempEditedTask,
        taskImage: preview,
        taskImageFile: {
          fileName: file.name,
          mimeType: file.type,
          contentBase64,
        },
        removeTaskImage: false,
      });
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setTempEditedTask({
      ...tempEditedTask,
      taskImage: '',
      taskImageFile: null,
      removeTaskImage: true,
    });
  };

  const handleSaveChanges = () => {
    onSave(tempEditedTask);
    onHide();
  };

  return (
    <Dialog
      open={show}
      onClose={onHide}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      slotProps={{
        paper: {
          component: 'form',
        },
      }}
    >
      <DialogTitle id="alert-dialog-title">Edit Task</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel sx={{ mt: 0 }} htmlFor="task">
              Task Title
            </CustomFormLabel>
            <CustomTextField
              id="task"
              name="task"
              variant="outlined"
              fullWidth
              value={tempEditedTask?.task || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="projectId" sx={{ mt: 0 }}>
              Linked Project
            </CustomFormLabel>
            <CustomSelect
              fullWidth
              id="projectId"
              variant="outlined"
              value={tempEditedTask?.projectId || ''}
              onChange={(event: any) =>
                setTempEditedTask({ ...tempEditedTask, projectId: event.target.value })
              }
            >
              <MenuItem value="">None</MenuItem>
              {(Array.isArray(projectsData?.data) ? projectsData.data : []).map((project: any) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                  {project.projectType ? ` (${project.projectType.name})` : ''}
                </MenuItem>
              ))}
            </CustomSelect>
          </Grid>
          <Grid size={12}>
            <CustomFormLabel sx={{ mt: 0 }} htmlFor="task-text">
              Text
            </CustomFormLabel>
            <CustomTextField
              id="task-text"
              variant="outlined"
              fullWidth
              name="taskText"
              value={tempEditedTask?.taskText || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}>
            <CustomFormLabel htmlFor="taskImageFile" sx={{ mt: 0 }}>
              Task Image
            </CustomFormLabel>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <Button component="label" variant="outlined" disabled={uploadingImage}>
                {uploadingImage ? 'Uploading...' : imagePreview ? 'Replace Image' : 'Upload Image'}
                <input
                  id="taskImageFile"
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />
              </Button>
              {imagePreview ? (
                <Button color="error" variant="text" onClick={handleRemoveImage}>
                  Remove Image
                </Button>
              ) : null}
              <Typography variant="body2" color="text.secondary">
                JPG, PNG, or WebP.
              </Typography>
            </Stack>
            {imagePreview ? (
              <Box
                component="img"
                src={imagePreview}
                alt="Task preview"
                sx={{
                  mt: 2,
                  width: '100%',
                  maxHeight: 220,
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            ) : null}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" onClick={onHide}>
          Close
        </Button>
        <Button variant="contained" onClick={handleSaveChanges} autoFocus>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditTaskModal;

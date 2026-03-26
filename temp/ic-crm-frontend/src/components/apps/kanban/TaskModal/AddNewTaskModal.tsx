import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
  MenuItem,
} from '@mui/material';
import useSWR from 'swr';
import CustomFormLabel from 'src/components/forms/theme-elements/CustomFormLabel';
import CustomSelect from 'src/components/forms/theme-elements/CustomSelect';
import CustomTextField from 'src/components/forms/theme-elements/CustomTextField';
import { getFetcher } from 'src/api/globalFetcher';
import { crmSwrOptions } from 'src/lib/swrOptions';
import { fileToBase64 } from 'src/lib/fileToBase64';

function AddNewTaskModal({ show, onHide, onSave, newTaskData, setNewTaskData }: any) {
  const { data: projectsData } = useSWR('/api/projects', getFetcher, crmSwrOptions);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { task, taskText, taskImage, projectId } = newTaskData;

  const handleSave = () => {
    onSave();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingImage(true);
    try {
      const contentBase64 = await fileToBase64(file);
      setNewTaskData({
        ...newTaskData,
        taskImage: `data:${file.type};base64,${contentBase64}`,
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

  const clearImage = () => {
    setNewTaskData({
      ...newTaskData,
      taskImage: '',
      taskImageFile: null,
      removeTaskImage: true,
    });
  };

  const isFormValid = () => {
    return Boolean(task?.trim() && taskText?.trim());
  };

  return (
    <Dialog
      open={show}
      onClose={onHide}
      slotProps={{
        paper: {
          component: 'form',
        },
      }}
    >
      <DialogTitle>Add Task</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel sx={{ mt: 0 }} htmlFor="task">
              Task Title *
            </CustomFormLabel>
            <CustomTextField
              id="task"
              variant="outlined"
              fullWidth
              value={task}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setNewTaskData({ ...newTaskData, task: event.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="taskText" sx={{ mt: 0 }}>
              Text *
            </CustomFormLabel>
            <CustomTextField
              id="taskText"
              variant="outlined"
              fullWidth
              value={taskText}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setNewTaskData({ ...newTaskData, taskText: event.target.value })
              }
            />
          </Grid>
          <Grid size={12}>
            <CustomFormLabel htmlFor="taskImageFile" sx={{ mt: 0 }}>
              Task Image
            </CustomFormLabel>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <Button component="label" variant="outlined" disabled={uploadingImage}>
                {uploadingImage ? 'Uploading...' : taskImage ? 'Replace Image' : 'Upload Image'}
                <input
                  id="taskImageFile"
                  hidden
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                />
              </Button>
              {taskImage ? (
                <Button color="error" variant="text" onClick={clearImage}>
                  Remove Image
                </Button>
              ) : null}
              <Typography variant="body2" color="text.secondary">
                JPG, PNG, or WebP.
              </Typography>
            </Stack>
            {taskImage ? (
              <Box
                component="img"
                src={taskImage}
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="projectId" sx={{ mt: 0 }}>
              Linked Project
            </CustomFormLabel>
            <CustomSelect
              fullWidth
              id="projectId"
              variant="outlined"
              value={projectId || ''}
              onChange={(event: { target: { value: any } }) =>
                setNewTaskData({ ...newTaskData, projectId: event.target.value })
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
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="error" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!isFormValid()}>
          Add Task
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddNewTaskModal;

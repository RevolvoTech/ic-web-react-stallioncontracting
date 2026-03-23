
import { SetStateAction, useContext, useEffect, useState } from 'react';
import { IconPlus, IconDotsVertical } from '@tabler/icons-react';
import TaskData from './TaskData';
import EditCategoryModal from './TaskModal/EditCategoryModal';
import AddNewTaskModal from './TaskModal/AddNewTaskModal';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { KanbanDataContext } from 'src/context/kanbancontext/index';

import { postFetcher } from "src/api/globalFetcher";
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { mutate } from 'swr';

function CategoryTaskList({ id }: any) {
  const { todoCategories, deleteCategory, clearAllTasks, deleteTodo, setTodoCategories } =
    useContext(KanbanDataContext);

  const category = todoCategories.find((cat) => cat.id === id) as any;

  const [allTasks, setAllTasks] = useState(category ? category.child : []);
  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(category.name);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showContainer, setShowContainer] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Find the category and update tasks
  useEffect(() => {
    const category = todoCategories.find((cat) => cat.id === id);
    if (category) {
      setAllTasks(category.child);
    }
  }, [todoCategories, id]);

  const [newTaskData, setNewTaskData]: any = useState({
    task: '',
    taskText: '',
    taskProperty: '',
    date: new Date().toISOString().split('T')[0],
    taskImage: 'https://adminmart.github.io/template_api/images/website-template/endeavor/endeavor-nextjs-14-website-template.jpg',
    projectId: '',
  });

  //Shows the modal for adding a new task.
  const handleShowModal = () => {
    setShowModal(true);
  };
  // Closes the modal
  const handleCloseModal = (): any => {
    setShowModal(false);
  };
  //  Shows the modal for editing a category.
  const handleShowEditCategoryModal = () => {
    handleClose();
    setShowEditCategoryModal(true);
  };
  //Closes the modal for editing a category.
  const handleCloseEditCategoryModal = () => setShowEditCategoryModal(false);

  const handleUpdateCategory = async (
    updatedName: SetStateAction<string | any>
  ) => {
    try {
      const response = await mutate('/api/TodoData/updateCategory', postFetcher("/api/TodoData/updateCategory", {
        categoryId: id,
        categoryName: updatedName,
      }), false);
      if (response?.status === 200) {
        setNewCategoryName(updatedName);
        if (response?.data) {
          setTodoCategories(response.data);
        }
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleAddTask = async () => {
    try {
      const response = await mutate("/api/TodoData/addTask", postFetcher("/api/TodoData/addTask", {
        categoryId: id,
        newTaskData,
      }), false);

      if (response.status === 200) {
        handleCloseModal();
        setNewTaskData({
          task: '',
          taskText: '',
          taskProperty: '',
          date: new Date().toISOString().split('T')[0],
          taskImage: 'https://adminmart.github.io/template_api/images/website-template/endeavor/endeavor-nextjs-14-website-template.jpg',
          projectId: '',
        });
        if (response?.data) {
          setTodoCategories(response.data);
        }

      } else {
        throw new Error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Clears all tasks from the current category.
  const handleClearAll = async () => {
    await clearAllTasks(id);
    setAllTasks([]);
  };

  // Deletes a specific task.
  const handleDeleteTask = async (taskId: number | any) => {
    await deleteTodo(taskId);
    setAllTasks((prevTasks: any[]) => prevTasks.filter((task: { id: number }) => task.id !== taskId));
  };

  //Handles the deletion of the current category.
  const handleDeleteClick = () => {
    setShowContainer(false);
    deleteCategory(id);
  };

  const backgroundColor = category
    ? category.name === 'Todo'
      ? 'primary.light'
      : category.name === 'Progress'
        ? 'secondary.light'
        : category.name === 'Pending'
          ? 'warning.light'
          : category.name === 'Done'
            ? 'success.light'
            : 'primary.light'
    : 'primary.light';

  return (
    <>
      <Box width="265px" flexShrink="0px">
        {showContainer && category && (
          <Box px={3} py={2} sx={{ backgroundColor }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" className="fw-semibold">
                {newCategoryName}
              </Typography>
              <Stack direction="row">
                <Box>
                  {category.name === 'Todo' && (
                    <>
                      <Tooltip title="Add Task">
                        <IconButton onClick={handleShowModal}>
                          <IconPlus size="1rem" />
                        </IconButton>
                      </Tooltip>
                      <AddNewTaskModal
                        show={showModal}
                        onHide={handleCloseModal}
                        onSave={handleAddTask}
                        newTaskData={newTaskData}
                        setNewTaskData={setNewTaskData}
                        updateTasks={() => setAllTasks([...allTasks, newTaskData])}
                      />
                    </>
                  )}
                  <EditCategoryModal
                    showModal={showEditCategoryModal}
                    handleCloseModal={handleCloseEditCategoryModal}
                    initialCategoryName={newCategoryName}
                    handleUpdateCategory={handleUpdateCategory}
                  />
                </Box>
                <Tooltip title="Menu">
                  <IconButton onClick={handleClick}>
                    <IconDotsVertical size="1rem" />
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem onClick={handleShowEditCategoryModal}>Edit</MenuItem>
                  <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
                  <MenuItem onClick={handleClearAll}>Clear All</MenuItem>
                </Menu>
              </Stack>
            </Box>
            {allTasks?.map((task: { id: any }, index: number) => (
              <TaskData
                key={task?.id || index}
                task={task}
                onDeleteTask={() => handleDeleteTask(task.id)}
                index={index} />
            ))}
          </Box>
        )}
      </Box>
    </>
  );
}
export default CategoryTaskList;

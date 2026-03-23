// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useContext } from 'react';

import {
  ListItemText,
  ListItemButton,
  List,
  Divider,
  ListItemIcon,
  Typography,
} from '@mui/material';

import Scrollbar from 'src/components/custom-scroll/Scrollbar';
import { IconMail, IconSend, IconBucket, IconFolder } from '@tabler/icons-react';
import ContactAdd from './ContactAdd';
import { ContactContext } from "src/context/ConatactContext";
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useAuth } from 'src/context/AuthContext';

interface DataType {
  id: number;
  name?: string;
  sort?: string;
  icon?: any;
  filterbyTitle?: string;
  devider?: boolean;
  color?: string;
}

const ContactFilter = () => {
  const { profile } = useAuth();

  const { isBorderRadius } = useContext(CustomizerContext);
  const br = `${isBorderRadius}px`;

  const { setSelectedDepartment, updateSearchTerm, selectedDepartment } = useContext(ContactContext);

  const filterData: DataType[] = [
    {
      id: 2,
      name: 'All',
      sort: 'show_all',
      icon: IconMail,
    },
    {
      id: 3,
      name: 'Frequent',
      sort: 'frequent_contact',
      icon: IconSend,
    },
    {
      id: 4,
      name: 'Starred',
      sort: 'starred_contact',
      icon: IconBucket,
    },
    {
      id: 6,
      devider: true,
    },
    {
      id: 5,
      filterbyTitle: 'Status',
    },

    {
      id: 7,
      name: 'lead',
      sort: 'lead_status',
      icon: IconFolder,
      color: 'primary.main',
    },
    {
      id: 8,
      name: 'active',
      sort: 'active_status',
      icon: IconFolder,
      color: 'error.main',
    },
    {
      id: 9,
      name: 'inactive',
      sort: 'inactive_status',
      icon: IconFolder,
      color: 'success.main',
    },
    {
      id: 10,
      name: 'archived',
      sort: 'archived_status',
      icon: IconFolder,
      color: 'warning.main',
    },
  ];

  const handleDepartmentClick = (department: string) => {
    setSelectedDepartment(department);
    updateSearchTerm("");
  };


  return (
    <>
      <ContactAdd />
      {profile?.permissions.readOnly ? (
        <Typography variant="caption" color="textSecondary" px={3}>
          Read-only role: create and edit actions are disabled.
        </Typography>
      ) : null}
      <List>
        <Scrollbar sx={{ height: { lg: 'calc(100vh - 100px)', md: '100vh' }, maxHeight: '800px' }}>
          {filterData.map((filter) => {
            if (filter.filterbyTitle) {
              return (
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  pl={5.1}
                  mt={1}
                  pb={2}
                  key={filter.id}
                >
                  {filter.filterbyTitle}
                </Typography>
              );
            } else if (filter.devider) {
              return <Divider key={filter.id} sx={{ mb: 3 }} />;
            }

            return (
              <ListItemButton
                sx={{ mb: 1, mx: 3, borderRadius: br }}
                selected={selectedDepartment === `${filter.name}`}

                onClick={() => handleDepartmentClick(filter.name || '')}
                key={filter.id}
              >
                <ListItemIcon sx={{ minWidth: '30px', color: filter.color }}>
                  <filter.icon stroke="1.5" size={19} />
                </ListItemIcon>
                <ListItemText>{filter.name}</ListItemText>
              </ListItemButton>
            );
          })}
        </Scrollbar>
      </List>
    </>
  );
};

export default ContactFilter;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { RequireAuth, RequireGuest } from './guards/AuthGuards';
import FullLayout from '../layouts/full/FullLayout';
import BlankLayout from '../layouts/blank/BlankLayout';
import ModernDash from '../views/dashboard/Modern';
import Contacts from '../views/apps/contacts/Contacts';
import Chats from '../views/apps/chat/Chat';
import Notes from '../views/apps/notes/Notes';
import Tickets from '../views/apps/tickets/Tickets';
import Calendar from '../views/apps/calendar/BigCalendar';
import Kanban from '../views/apps/kanban/Kanban';
import Onboarding from '../views/apps/onboarding/Onboarding';
import TeamMembers from '../views/apps/team/TeamMembers';
import ProfileSettings from '../views/pages/account-setting/AccountSetting';
import InvoiceList from '../views/apps/invoice/List';
import InvoiceCreate from '../views/apps/invoice/Create';
import InvoiceEdit from '../views/apps/invoice/Edit';
import InvoiceDetail from '../views/apps/invoice/Detail';
import Projects from '../views/apps/projects/Projects';
import ProjectTypes from '../views/apps/projects/ProjectTypes';
import ProjectDetail from '../views/apps/projects/ProjectDetail';
import Login from '../views/authentication/auth1/Login';
import ForgotPassword from '../views/authentication/auth1/ForgotPassword';
import ResetPassword from '../views/authentication/auth1/ResetPassword';
import Error from '../views/authentication/Error';

const Router = [
  {
    path: '/',
    element: (
      <RequireAuth>
        <FullLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboards/modern" /> },
      { path: '/dashboards/modern', element: <ModernDash /> },
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/apps/contacts', element: <Contacts /> },
      { path: '/apps/chats', element: <Chats /> },
      { path: '/apps/notes', element: <Notes /> },
      { path: '/apps/tickets', element: <Tickets /> },
      { path: '/apps/calendar', element: <Calendar isBreadcrumb={true} /> },
      { path: '/apps/kanban', element: <Kanban /> },
      { path: '/apps/projects', element: <Projects /> },
      { path: '/apps/project-types', element: <ProjectTypes /> },
      { path: '/apps/projects/:projectId', element: <ProjectDetail /> },
      { path: '/apps/team', element: <TeamMembers /> },
      { path: '/apps/profile', element: <ProfileSettings /> },
      { path: '/apps/invoice', element: <Navigate to="/apps/invoice/list" /> },
      { path: '/apps/invoice/list', element: <InvoiceList /> },
      { path: '/apps/invoice/create', element: <InvoiceCreate /> },
      { path: '/apps/invoice/edit/:billFrom', element: <InvoiceEdit /> },
      { path: '/apps/invoice/detail/:billFrom', element: <InvoiceDetail /> },
      { path: '*', element: <Navigate to="/dashboards/modern" /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/404', element: <Error /> },
      {
        path: '/auth/login',
        element: (
          <RequireGuest>
            <Login />
          </RequireGuest>
        ),
      },
      { path: '/auth/register', element: <Navigate to="/auth/login" replace /> },
      {
        path: '/auth/forgot-password',
        element: (
          <RequireGuest>
            <ForgotPassword />
          </RequireGuest>
        ),
      },
      {
        path: '/auth/reset-password',
        element: <ResetPassword />,
      },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;

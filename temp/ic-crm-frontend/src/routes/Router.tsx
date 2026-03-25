// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import { RequireAuth, RequireGuest } from './guards/AuthGuards';

/* Layouts */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* CRM Apps */
const ModernDash = Loadable(lazy(() => import('../views/dashboard/Modern')));
const Contacts = Loadable(lazy(() => import('../views/apps/contacts/Contacts')));
const Chats = Loadable(lazy(() => import('../views/apps/chat/Chat')));
const Notes = Loadable(lazy(() => import('../views/apps/notes/Notes')));
const Tickets = Loadable(lazy(() => import('../views/apps/tickets/Tickets')));
const Calendar = Loadable(lazy(() => import('../views/apps/calendar/BigCalendar')));
const Kanban = Loadable(lazy(() => import('../views/apps/kanban/Kanban')));
const Onboarding = Loadable(lazy(() => import('../views/apps/onboarding/Onboarding')));
const TeamMembers = Loadable(lazy(() => import('../views/apps/team/TeamMembers')));
const ProfileSettings = Loadable(lazy(() => import('../views/pages/account-setting/AccountSetting')));
const InvoiceList = Loadable(lazy(() => import('../views/apps/invoice/List')));
const InvoiceCreate = Loadable(lazy(() => import('../views/apps/invoice/Create')));
const InvoiceEdit = Loadable(lazy(() => import('../views/apps/invoice/Edit')));
const InvoiceDetail = Loadable(lazy(() => import('../views/apps/invoice/Detail')));
const Projects = Loadable(lazy(() => import('../views/apps/projects/Projects')));
const ProjectDetail = Loadable(lazy(() => import('../views/apps/projects/ProjectDetail')));

/* Authentication */
const Login = Loadable(lazy(() => import('../views/authentication/auth1/Login')));
const ForgotPassword = Loadable(lazy(() => import('../views/authentication/auth1/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('../views/authentication/auth1/ResetPassword')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));

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

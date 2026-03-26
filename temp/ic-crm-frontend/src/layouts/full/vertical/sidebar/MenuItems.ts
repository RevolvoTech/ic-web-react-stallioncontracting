import { uniqueId } from 'lodash';
import {
  IconAperture,
  IconCalendar,
  IconFolders,
  IconMessage2,
  IconNotebook,
  IconNotes,
  IconPackage,
  IconFileDescription,
  IconShieldLock,
  IconTicket,
  IconUserCircle,
} from '@tabler/icons-react';

interface MenuitemsType {
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  adminOnly?: boolean;
}

const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: 'CRM',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconAperture,
    href: '/dashboards/modern',
  },
  {
    id: uniqueId(),
    title: 'Customers',
    icon: IconPackage,
    href: '/apps/contacts',
  },
  {
    id: uniqueId(),
    title: 'Chat',
    icon: IconMessage2,
    href: '/apps/chats',
  },
  {
    id: uniqueId(),
    title: 'Notes',
    icon: IconNotes,
    href: '/apps/notes',
  },
  {
    id: uniqueId(),
    title: 'Tickets',
    icon: IconTicket,
    href: '/apps/tickets',
  },
  {
    id: uniqueId(),
    title: 'Calendar',
    icon: IconCalendar,
    href: '/apps/calendar',
  },
  {
    id: uniqueId(),
    title: 'Projects',
    icon: IconFolders,
    href: '/apps/projects',
  },
  {
    id: uniqueId(),
    title: 'Timeline',
    icon: IconCalendar,
    href: '/apps/timeline',
  },
  {
    id: uniqueId(),
    title: 'Kanban',
    icon: IconNotebook,
    href: '/apps/kanban',
  },
  {
    id: uniqueId(),
    title: 'Invoices',
    icon: IconFileDescription,
    href: '/apps/invoice/list',
  },
  {
    navlabel: true,
    subheader: 'Administration',
  },
  {
    id: uniqueId(),
    title: 'Profile',
    icon: IconUserCircle,
    href: '/apps/profile',
  },
  {
    id: uniqueId(),
    title: 'Team & Roles',
    icon: IconShieldLock,
    href: '/apps/team',
  },
  {
    id: uniqueId(),
    title: 'Project Types',
    icon: IconShieldLock,
    href: '/apps/project-types',
    adminOnly: true,
  },
];

export default Menuitems;

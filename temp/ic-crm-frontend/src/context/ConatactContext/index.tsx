import { createContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { ContactType } from '../../types/apps/contact';
import React from 'react';
import { crmRequest } from 'src/api/crm/client';
import { useAuth } from 'src/context/AuthContext';
import { isAbortError } from 'src/lib/fetchWithTimeout';
import user1 from 'src/assets/images/profile/user-1.jpg';
import user2 from 'src/assets/images/profile/user-2.jpg';
import user3 from 'src/assets/images/profile/user-3.jpg';
import user4 from 'src/assets/images/profile/user-4.jpg';
import user5 from 'src/assets/images/profile/user-5.jpg';

const avatars = [user1, user2, user3, user4, user5];

type CustomerListItem = {
  id: string;
  name: string;
  customerType: 'individual' | 'business';
  status: 'lead' | 'active' | 'inactive' | 'archived';
  source: string | null;
  ownerOrgId: string;
  createdBy: string;
  lifecycleStage: string | null;
  tags: string[];
  primaryEmail: string | null;
  primaryPhone: string | null;
  assignedCount: number;
};

type CustomerDetail = {
  id: string;
  name: string;
  customerType: 'individual' | 'business';
  status: 'lead' | 'active' | 'inactive' | 'archived';
  source: string | null;
  ownerOrgId: string;
  createdBy: string;
  profile: {
    lifecycleStage: string | null;
    tags: string[];
    companyName: string | null;
    industry: string | null;
    website: string | null;
    taxId: string | null;
    birthDate: string | null;
  };
  contacts: Array<{ type: 'phone' | 'email' | 'other'; value: string; isPrimary: boolean }>;
  addresses: Array<{ line1: string; city: string | null; state: string | null; country: string | null }>;
  notes: Array<{ id: string; body: string }>;
};

const avatarForId = (id: string | number) => {
  const text = String(id);
  let seed = 0;
  for (let i = 0; i < text.length; i += 1) {
    seed += text.charCodeAt(i);
  }
  return avatars[seed % avatars.length];
};

const splitName = (name: string) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return { firstname: '', lastname: '' };
  }

  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(' '),
  };
};

const mapListItemToContact = (item: CustomerListItem): ContactType => {
  const name = splitName(item.name);
  return {
    id: item.id,
    firstname: name.firstname,
    lastname: name.lastname,
    image: avatarForId(item.id),
    department: item.lifecycleStage || item.status,
    company: '',
    phone: item.primaryPhone || '',
    email: item.primaryEmail || '',
    address: '',
    notes: '',
    frequentlycontacted: item.assignedCount > 0,
    starred: (item.tags || []).includes('starred'),
    deleted: item.status === 'archived',
    status: item.status,
    customerType: item.customerType,
    source: item.source || '',
    ownerOrgId: item.ownerOrgId,
    tags: item.tags || [],
  };
};

const mapDetailToContact = (detail: CustomerDetail): ContactType => {
  const name = splitName(detail.name);
  const emailContact = detail.contacts.find((contact) => contact.type === 'email');
  const phoneContact = detail.contacts.find((contact) => contact.type === 'phone');
  const address = detail.addresses[0];
  const latestNote = detail.notes[0];

  return {
    id: detail.id,
    firstname: name.firstname,
    lastname: name.lastname,
    image: avatarForId(detail.id),
    department: detail.profile.lifecycleStage || detail.status,
    company: detail.profile.companyName || '',
    phone: phoneContact?.value || '',
    email: emailContact?.value || '',
    address: address?.line1 || '',
    notes: latestNote?.body || '',
    frequentlycontacted: false,
    starred: (detail.profile.tags || []).includes('starred'),
    deleted: detail.status === 'archived',
    status: detail.status,
    customerType: detail.customerType,
    source: detail.source || '',
    ownerOrgId: detail.ownerOrgId,
    tags: detail.profile.tags || [],
  };
};

const defaultContact: ContactType = {
  id: '',
  firstname: '',
  lastname: '',
  image: user1,
  department: '',
  company: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  frequentlycontacted: false,
  starred: false,
  deleted: false,
};

export interface ContactContextType {
  selectedDepartment: string;
  setSelectedDepartment: React.Dispatch<React.SetStateAction<string>>;
  contacts: ContactType[];
  setContacts: React.Dispatch<React.SetStateAction<ContactType[]>>;
  starredContacts: Array<string | number>;
  setStarredContacts: React.Dispatch<React.SetStateAction<Array<string | number>>>;
  selectedContact: ContactType | null;
  setSelectedContact: React.Dispatch<React.SetStateAction<ContactType | null>>;
  addContact: (newContact: ContactType) => Promise<void>;
  deleteContact: (contactId: number | string) => Promise<void>;
  updateContact: (updatedContact: ContactType) => Promise<void>;
  selectContact: (contact: ContactType) => Promise<void>;
  toggleStarred: (contactId: number | string) => Promise<void>;
  searchTerm: string;
  updateSearchTerm: (term: string) => void;
  openModal: boolean;
  setOpenModal: (collapse: boolean) => void;
  loading: boolean;
  error: any;
}

export const ContactContext = createContext<ContactContextType | any>(undefined);

export const ContactContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session, activeOrgId, getAccessToken } = useAuth();
  const detailAbortRef = useRef<AbortController | null>(null);

  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [starredContacts, setStarredContacts] = useState<Array<string | number>>([]);
  const [selectedContact, setSelectedContact] = useState<ContactType | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const callApi = async <T,>(
    path: string,
    method = 'GET',
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Missing session token');
    }

    return (await crmRequest(path, {
      token,
      orgId: activeOrgId,
      method,
      body,
      signal,
    })) as T;
  };

  const refreshCustomers = useCallback(async (signal?: AbortSignal) => {
    if (!session) {
      setContacts([]);
      setSelectedContact(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await callApi<{ items: CustomerListItem[] }>(
        '/api/customers?page=1&pageSize=200',
        'GET',
        undefined,
        signal,
      );
      const mapped = data.items.map(mapListItemToContact);
      setContacts(mapped);
      setStarredContacts(mapped.filter((contact) => contact.starred).map((contact) => contact.id));
      setSelectedContact((current) => {
        if (mapped.length === 0) {
          return null;
        }
        if (!current) {
          return mapped[0];
        }
        return mapped.find((contact) => contact.id === current.id) || mapped[0];
      });
      setError(null);
    } catch (apiError) {
      if (isAbortError(apiError)) {
        return;
      }
      setError(apiError);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [activeOrgId, getAccessToken, session]);

  useEffect(() => {
    const controller = new AbortController();

    refreshCustomers(controller.signal).catch(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });

    return () => {
      controller.abort();
      detailAbortRef.current?.abort();
    };
  }, [session, activeOrgId]);

  const updateSearchTerm = (term: string) => {
    setSearchTerm(term);
  };

  const fetchContactDetail = async (contactId: number | string, signal?: AbortSignal) => {
    const detail = await callApi<CustomerDetail>(`/api/customers/${contactId}`, 'GET', undefined, signal);
    return mapDetailToContact(detail);
  };

  const addContact = async (newContact: ContactType) => {
    const name = `${newContact.firstname || ''} ${newContact.lastname || ''}`.trim();
    if (!name) {
      throw new Error('First name or last name is required');
    }

    await callApi('/api/customers', 'POST', {
      name,
      customerType: newContact.customerType || 'individual',
      status: newContact.deleted ? 'archived' : 'lead',
      source: newContact.source || null,
      profile: {
        lifecycleStage: newContact.department || null,
        tags: newContact.starred ? ['starred'] : [],
        companyName: newContact.company || null,
      },
      contacts: [
        ...(newContact.email ? [{ type: 'email', value: newContact.email, isPrimary: true }] : []),
        ...(newContact.phone ? [{ type: 'phone', value: newContact.phone, isPrimary: true }] : []),
      ],
      addresses: [
        ...(newContact.address
          ? [{ addressType: 'service', line1: newContact.address, isPrimary: true }]
          : []),
      ],
    });

    await refreshCustomers();
  };

  const deleteContact = async (contactId: string | number) => {
    await callApi(`/api/customers/${contactId}/archive`, 'POST');
    await refreshCustomers();

    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact(null);
    }
  };

  const updateContact = async (updatedContact: ContactType) => {
    const detail = await callApi<CustomerDetail>(`/api/customers/${updatedContact.id}`);
    const tags = new Set(detail.profile.tags || []);

    if (updatedContact.starred) {
      tags.add('starred');
    } else {
      tags.delete('starred');
    }

    await callApi(`/api/customers/${updatedContact.id}`, 'PATCH', {
      name: `${updatedContact.firstname || ''} ${updatedContact.lastname || ''}`.trim(),
      customerType: updatedContact.customerType || detail.customerType,
      status: updatedContact.deleted ? 'archived' : updatedContact.status || detail.status,
      source: updatedContact.source ?? detail.source,
      profile: {
        lifecycleStage: updatedContact.department || detail.profile.lifecycleStage,
        tags: Array.from(tags),
        companyName: updatedContact.company || detail.profile.companyName,
        industry: detail.profile.industry,
        website: detail.profile.website,
        taxId: detail.profile.taxId,
        birthDate: detail.profile.birthDate,
      },
    });

    if (updatedContact.notes && updatedContact.notes !== detail.notes[0]?.body) {
      await callApi(`/api/customers/${updatedContact.id}/notes`, 'POST', {
        body: updatedContact.notes,
      });
    }

    const freshDetail = await fetchContactDetail(updatedContact.id);
    setSelectedContact(freshDetail || defaultContact);
    await refreshCustomers();
  };

  const selectContact = async (contact: ContactType) => {
    setSelectedContact(contact);
    detailAbortRef.current?.abort();
    const controller = new AbortController();
    detailAbortRef.current = controller;
    try {
      const freshDetail = await fetchContactDetail(contact.id, controller.signal);
      if (!controller.signal.aborted) {
        setSelectedContact(freshDetail);
      }
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      // keep existing selected contact when detail fetch fails
    } finally {
      if (detailAbortRef.current === controller) {
        detailAbortRef.current = null;
      }
    }
  };

  const toggleStarred = async (contactId: number | string) => {
    const target = contacts.find((contact) => Number(contact.id) === Number(contactId));
    if (!target) {
      return;
    }

    const updated = { ...target, starred: !target.starred };
    await updateContact(updated);
  };

  const contextValue: ContactContextType = {
    selectedDepartment,
    setSelectedDepartment,
    contacts,
    setContacts,
    starredContacts,
    setStarredContacts,
    selectedContact,
    setSelectedContact,
    addContact,
    deleteContact,
    updateContact,
    error,
    loading,
    selectContact,
    toggleStarred,
    searchTerm,
    updateSearchTerm,
    openModal,
    setOpenModal,
  };

  return <ContactContext.Provider value={contextValue}>{children}</ContactContext.Provider>;
};

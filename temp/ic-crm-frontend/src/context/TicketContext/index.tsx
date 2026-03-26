import { createContext, useState, useEffect } from 'react';
import { TicketType } from '../../types/apps/ticket';
import { getFetcher, deleteFetcher, postFetcher } from 'src/api/globalFetcher';
import { crmSwrOptions } from 'src/lib/swrOptions';

import useSWR from 'swr';

type NewTicketPayload = {
    ticketTitle: string;
    ticketDescription: string;
    Status: string;
    projectId?: string | null;
    agentUserId?: string | null;
};

export interface TicketContextType {
    tickets: TicketType[];
    deleteTicket: (id: number) => void;
    addTicket: (ticket: NewTicketPayload) => Promise<void>;
    setTicketSearch: (searchTerm: string) => void;
    searchTickets: (searchTerm: string) => void;
    ticketSearch: string;
    filter: string;
    error: null;
    loading: boolean;
    setFilter: (filter: string) => void;

}

// Create Context
export const TicketContext = createContext<TicketContextType>({} as TicketContextType);

// Provider Component
export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [ticketSearch, setTicketSearch] = useState<string>('');
    const [filter, setFilter] = useState<string>('total_tickets');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    // Fetch tickets from the API when the component mounts using useEffect
    const { data: ticketsData, isLoading: isTicketsLoading, error: ticketsError, mutate } = useSWR("/api/data/ticket/TicketData", getFetcher, crmSwrOptions)
    useEffect(() => {
        if (ticketsData) {
            setTickets(ticketsData.data);
            setLoading(isTicketsLoading);
        } else if (ticketsError) {
            setError(ticketsError);
            setLoading(isTicketsLoading);
        } else {
            setLoading(isTicketsLoading);
        }
    }, [ticketsData, ticketsError, isTicketsLoading]);

    // Delete a ticket with the specified ID from the server and update the tickets state
    const deleteTicket = async (id: number) => {
        try {
            await mutate(deleteFetcher('/api/data/ticket/delete', { id }))
            setTickets((prevTickets) => {
                // Filter out the ticket with the given ID from the tickets list
                const updatedTickets = prevTickets.filter((ticket) => ticket.Id !== id);
                return updatedTickets;
            });
        } catch (err) {
            console.error('Error deleting ticket:', err);
        }
    };

    const addTicket = async (ticket: NewTicketPayload) => {
        try {
            const response = await mutate(postFetcher('/api/data/ticket/add', ticket), false);
            if (response?.data) {
                setTickets(response.data);
            }
        } catch (err) {
            console.error('Error creating ticket:', err);
            throw err;
        }
    };

    // Update the ticket search term state based on the provided search term value.
    const searchTickets = (searchTerm: string) => {
        setTicketSearch(searchTerm);
    };

    return (
        <TicketContext.Provider
            value={{ tickets, error, loading, deleteTicket, addTicket, setTicketSearch, searchTickets, ticketSearch, filter, setFilter }}
        >
            {children}
        </TicketContext.Provider>
    );
};



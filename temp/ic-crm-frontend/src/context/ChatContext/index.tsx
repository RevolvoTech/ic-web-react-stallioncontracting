'use client'
import { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import React from "react";
import useSWR from 'swr';
import { ChatsType, MessageType } from '../../types/apps/chat';
import { getFetcher, postFetcher } from 'src/api/globalFetcher';


// Define context props interface
export interface ChatContextProps {
    chatData: ChatsType[];
    chatContent: any[];
    chatSearch: string;
    selectedChat: ChatsType | null;
    loading: boolean;
    error: string;
    activeChatId: number | null;
    setChatContent: Dispatch<SetStateAction<any[]>>;
    setChatSearch: Dispatch<SetStateAction<string>>;
    setSelectedChat: Dispatch<SetStateAction<ChatsType | null>>;
    setActiveChatId: Dispatch<SetStateAction<number | null>>;
    sendMessage: (chatId: number | string, message: MessageType) => void;
    setLoading: Dispatch<SetStateAction<boolean>>;
    setError: Dispatch<SetStateAction<string>>;
}

// Create the context
export const ChatContext = createContext<ChatContextProps>({
    chatData: [],
    chatContent: [],
    chatSearch: '',
    selectedChat: null,
    loading: true,
    error: '',
    activeChatId: null,
    setChatContent: () => { },
    setChatSearch: () => { },
    setSelectedChat: () => { },
    setActiveChatId: () => { },
    sendMessage: () => { },
    setLoading: () => { },
    setError: () => { },
});

// Create the provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chatData, setChatData] = useState<ChatsType[]>([]);
    const [chatContent, setChatContent] = useState<any[]>([]);
    const [chatSearch, setChatSearch] = useState<string>('');
    const [selectedChat, setSelectedChat] = useState<ChatsType | null>(null);
    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const { data: ChatsData, isLoading: isChatsLoading, error: Chatserror, mutate } = useSWR('/api/data/chat/ChatData', getFetcher);

    // Fetch chat data from the API
    useEffect(() => {
        if (ChatsData) {
            setLoading(isChatsLoading);
            const chatsData = ChatsData.data;
            if (chatData.length === 0) {
                const specificChat = chatsData[0] || null;
                setSelectedChat(specificChat);
                if (specificChat?.id !== undefined && specificChat?.id !== null) {
                    const parsedId =
                        typeof specificChat.id === 'number' ? specificChat.id : Number(specificChat.id);
                    setActiveChatId(Number.isFinite(parsedId) ? parsedId : null);
                } else {
                    setActiveChatId(null);
                }
            }
            setChatData(chatsData);
        } else if (Chatserror) {
            setError(Chatserror?.message || 'Failed to fetch chats');
            setLoading(isChatsLoading);
            console.log("Failed to fetch the data")
        }
        else {
            setLoading(isChatsLoading);
        }
    }, [ChatsData, Chatserror, isChatsLoading, chatData.length]);

    // Function to send a message to a chat identified by `chatId` using an API call.
    const sendMessage = async (chatId: number | string, message: MessageType) => {
        try {
            const response = await mutate(postFetcher('/api/sendMessage', { chatId, message }), false);
            const updatedChats = response?.data || [];
            setChatData(updatedChats);
            const updatedChat = updatedChats.find((chat: any) => String(chat.id) === String(chatId)) || null;
            setSelectedChat(updatedChat);
            if (updatedChat?.id !== undefined && updatedChat?.id !== null) {
                const parsedId = typeof updatedChat.id === 'number' ? updatedChat.id : Number(updatedChat.id);
                setActiveChatId(Number.isFinite(parsedId) ? parsedId : null);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const value: ChatContextProps = {
        chatData,
        chatContent,
        chatSearch,
        selectedChat,
        loading,
        error,
        activeChatId,
        setChatContent,
        setChatSearch,
        setSelectedChat,
        setActiveChatId,
        sendMessage,
        setError,
        setLoading,
    };
    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};



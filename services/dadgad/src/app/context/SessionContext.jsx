"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../services/envConfig';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/sessions/handshake`, {
                    withCredentials: true // Important for sending/receiving cookies
                });
                setSessionId(response.data.sessionId);
            } catch (error) {
                console.error("Failed to initialize session", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, []);

    return (
        <SessionContext.Provider value={{ sessionId, loading }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);

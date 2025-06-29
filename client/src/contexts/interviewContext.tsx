import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface InterviewInvitation {
  id: string;
  interviewer_email: string;
  interviewer_name: string;
  participant_email: string;
  participant_name: string;
  scheduled_at: string;
  duration_minutes: number;
  topics: string;
  description?: string;
  status: 'pending' | 'accepted' | 'cancelled' | 'completed';
  questions?: string;
  question_type?: 'dsa' | 'ai';
  invitation_token: string;
}

export interface InterviewSession {
  id: string;
  questions: any[];
  participants: string[];
  status: string;
  startTime?: string;
  endTime?: string;
}

interface InterviewContextType {
  currentInvitation: InterviewInvitation | null;
  currentSession: InterviewSession | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadInvitation: (token: string) => Promise<void>;
  acceptInvitation: (data: AcceptInvitationData) => Promise<void>;
  cancelInvitation: (interviewId: string, reason?: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

export interface AcceptInvitationData {
  interviewId: string;
  questionSelectionType: 'dsa' | 'ai';
  selectedQuestions?: string[];
  aiPrompt?: string;
  topics?: string[];
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

interface InterviewProviderProps {
  children: React.ReactNode;
}

export const InterviewProvider: React.FC<InterviewProviderProps> = ({ children }) => {
  const [currentInvitation, setCurrentInvitation] = useState<InterviewInvitation | null>(null);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvitation = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`/interview/invitation/${token}`);
      setCurrentInvitation(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invitation');
      console.error('Error loading invitation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async (data: AcceptInvitationData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/interview/accept', data);
      
      if (response.data.success) {
        // Update invitation status
        if (currentInvitation) {
          setCurrentInvitation({
            ...currentInvitation,
            status: 'accepted'
          });
        }
        
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
      console.error('Error accepting invitation:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelInvitation = async (interviewId: string, reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/interview/cancel', {
        interviewId,
        reason
      });
      
      if (response.data.success) {
        // Update invitation status
        if (currentInvitation) {
          setCurrentInvitation({
            ...currentInvitation,
            status: 'cancelled'
          });
        }
        
        return response.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel invitation');
      console.error('Error cancelling invitation:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`/interview/${sessionId}`);
      setCurrentSession(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load session');
      console.error('Error loading session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: InterviewContextType = {
    currentInvitation,
    currentSession,
    isLoading,
    error,
    loadInvitation,
    acceptInvitation,
    cancelInvitation,
    loadSession,
    clearError,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = (): InterviewContextType => {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};
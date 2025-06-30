import React, { createContext, useContext, useState, useCallback } from 'react';
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
  interview_id: string;
  interviewer_email: string;
  interviewer_name: string;
  participant_email: string;
  participant_name: string;
  scheduled_at: string;
  duration_minutes: number;
  topics: string;
  description?: string;
  status: 'pending' | 'accepted' | 'cancelled' | 'completed';
  session_status?: 'pending' | 'active' | 'completed' | 'cancelled';
  isInterviewer: boolean;
  isParticipant: boolean;
}

interface InterviewContextType {
  currentInvitation: InterviewInvitation | null;
  currentSession: InterviewSession | null;
  interviews: InterviewSession[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadInvitation: (token: string) => Promise<void>;
  acceptInvitation: (data: AcceptInvitationData) => Promise<void>;
  cancelInvitation: (interviewId: string, reason?: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  loadUserInterviews: () => Promise<void>;
  refreshInterviews: () => Promise<void>;
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
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvitation = useCallback(async (token: string) => {
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
  }, []);

  const acceptInvitation = useCallback(async (data: AcceptInvitationData) => {
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
  }, [currentInvitation]);

  const cancelInvitation = useCallback(async (interviewId: string, reason?: string) => {
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
  }, [currentInvitation]);

  const loadSession = useCallback(async (sessionId: string) => {
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
  }, []);

  const loadUserInterviews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/interview/my-interviews');
      setInterviews(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interviews');
      console.error('Error loading interviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshInterviews = useCallback(async () => {
    await loadUserInterviews();
  }, [loadUserInterviews]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: InterviewContextType = {
    currentInvitation,
    currentSession,
    interviews,
    isLoading,
    error,
    loadInvitation,
    acceptInvitation,
    cancelInvitation,
    loadSession,
    loadUserInterviews,
    refreshInterviews,
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
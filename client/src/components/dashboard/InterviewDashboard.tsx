import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';
import { useAuth } from '../../contexts/authContext';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface InterviewData {
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
  session_id?: string;
  session_status?: 'pending' | 'active' | 'completed' | 'cancelled';
  isInterviewer: boolean;
  isParticipant: boolean;
}

const InterviewDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/interview/my-interviews');
      setInterviews(response.data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isPast: date < new Date(),
      isToday: date.toDateString() === new Date().toDateString(),
      isWithinHour: Math.abs(date.getTime() - new Date().getTime()) <= 60 * 60 * 1000
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleJoinInterview = (interviewId: string) => {
    navigate(`/mock-arena/room/${interviewId}`);
  };

  const filteredInterviews = interviews.filter(interview => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return interview.status === 'accepted' && new Date(interview.scheduled_at) > new Date();
    if (filter === 'completed') return interview.status === 'completed';
    if (filter === 'cancelled') return interview.status === 'cancelled';
    return true;
  });

  const upcomingInterviews = interviews.filter(
    interview => interview.status === 'accepted' && new Date(interview.scheduled_at) > new Date()
  );

  const pendingInterviews = interviews.filter(interview => interview.status === 'pending');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Interview Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your scheduled interviews and sessions
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-green-600">{upcomingInterviews.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingInterviews.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-indigo-600">{interviews.length}</p>
              </div>
              <Video className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {interviews.filter(i => i.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'All Interviews' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as any)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {filteredInterviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No interviews found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'all' 
                  ? "You don't have any interviews scheduled yet."
                  : `No ${filter} interviews found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInterviews.map(interview => {
            const { date, time, isPast, isToday, isWithinHour } = formatDateTime(interview.scheduled_at);
            const canJoin = interview.status === 'accepted' && (isToday || isWithinHour);

            return (
              <Card key={interview.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {interview.isInterviewer ? 'Interview with' : 'Interview by'}{' '}
                          {interview.isInterviewer ? interview.participant_name : interview.interviewer_name}
                        </h3>
                        <Badge variant={getStatusVariant(interview.status) as any}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(interview.status)}
                            <span className="capitalize">{interview.status}</span>
                          </div>
                        </Badge>
                        {interview.isInterviewer && (
                          <Badge variant="info" size="sm">Interviewer</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="text-sm">{date}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="text-sm">{time} ({interview.duration_minutes} mins)</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <User className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {interview.isInterviewer ? interview.participant_email : interview.interviewer_email}
                          </span>
                        </div>
                      </div>

                      {interview.topics && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {interview.topics.split(',').map((topic, index) => (
                              <Badge key={index} variant="primary" size="sm">
                                {topic.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {interview.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {interview.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {canJoin && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleJoinInterview(interview.id)}
                          icon={<Play size={16} />}
                        >
                          Join Interview
                        </Button>
                      )}
                      
                      {interview.status === 'accepted' && !canJoin && !isPast && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJoinInterview(interview.id)}
                          icon={<Video size={16} />}
                        >
                          View Room
                        </Button>
                      )}

                      {interview.status === 'completed' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleJoinInterview(interview.id)}
                        >
                          View Summary
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InterviewDashboard;
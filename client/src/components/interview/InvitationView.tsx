import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Mail, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/authContext';
import { useInterview } from '../../contexts/interviewContext';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import LoadingSpinner from '../auth/LoadingSpinner';

const InvitationView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentInvitation, isLoading, error, loadInvitation, cancelInvitation } = useInterview();
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  useEffect(() => {
    if (token) {
      loadInvitation(token);
    }
  }, [token, loadInvitation]);

  useEffect(() => {
    if (!authLoading && currentInvitation) {
      if (!isAuthenticated) {
        // Redirect to login with return URL
        navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      }
    }
    console.log(currentInvitation?.topics)
  }, [isAuthenticated, authLoading, currentInvitation, navigate]);

  const handleAccept = () => {
    if (currentInvitation) {
      navigate(`/interview/questions/${currentInvitation.id}`);
    }
  };

  const handleCancel = async () => {
    if (!currentInvitation) return;
    
    try {
      setActionLoading(true);
      await cancelInvitation(currentInvitation.id, cancelReason);
      setShowCancelForm(false);
      // Show success message and redirect
      navigate('/mock-arena');
    } catch (error) {
      console.error('Error cancelling invitation:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  if (authLoading || isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Invitation Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={() => navigate('/mock-arena')}>
              Go to Mock Arena
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentInvitation) {
    return <LoadingSpinner />;
  }

  const { date, time } = formatDateTime(currentInvitation.scheduled_at);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎯 Mock Interview Invitation
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                You've been invited to a coding interview practice session
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Interview Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Interview Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Interviewer</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentInvitation.interviewer_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {currentInvitation.interviewer_email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{date}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Time & Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {time} ({currentInvitation.duration_minutes} mins)
                      </p>
                    </div>
                  </div>
                </div>

                {currentInvitation.topics && (
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-5 h-5 text-gray-500 mr-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Topics</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentInvitation.topics.split(',').map((topic, index) => (
                        <Badge key={index} variant="primary" size="sm">
                          {topic.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {currentInvitation.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                    <p className="text-gray-900 dark:text-white">{currentInvitation.description}</p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="text-center">
                {currentInvitation.status === 'pending' && (
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Please respond to this invitation
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="success"
                        onClick={handleAccept}
                        icon={<CheckCircle size={16} />}
                      >
                        Accept Interview
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => setShowCancelForm(true)}
                        icon={<XCircle size={16} />}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {currentInvitation.status === 'accepted' && (
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-600 mb-2">
                      Invitation Accepted!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You have successfully accepted this interview invitation.
                    </p>
                    <Button onClick={() => navigate(`/mock-arena/room/${currentInvitation.id}`)}>
                      Join Interview Room
                    </Button>
                  </div>
                )}

                {currentInvitation.status === 'cancelled' && (
                  <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-600 mb-2">
                      Invitation Cancelled
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This interview invitation has been cancelled.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Form Modal */}
      {showCancelForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cancel Invitation
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Please let the interviewer know why you're cancelling this invitation (optional):
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Schedule conflict, not available at this time..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={3}
              />
              <div className="flex space-x-3">
                <Button
                  variant="danger"
                  onClick={handleCancel}
                  isLoading={actionLoading}
                  className="flex-1"
                >
                  Cancel Invitation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCancelForm(false)}
                  className="flex-1"
                >
                  Keep Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InvitationView;
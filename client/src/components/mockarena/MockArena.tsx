import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Interview } from "../../types";
import Button from "../ui/Button";
import { BookOpen, Calendar, Clock, Mail, Plus, Send, User, X, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import InterviewForm from "./InterviewForm";
import Badge from "../ui/Badge";
import InterviewCard from "./InterviewCard";
import InterviewDashboard from "../dashboard/InterviewDashboard";
import { useInterview } from "../../contexts/interviewContext";
import axios from "axios";

const MockArena: React.FC = () => {
    const navigate = useNavigate();
    const { interviews, loadUserInterviews, refreshInterviews } = useInterview();
    const [showNewInterviewForm, setShowNewInterviewForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule'>('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        date: '',
        time: '',
        topics: '',
        name: '',
        duration: 60,
        description: ''
    });

    // Load interviews on component mount
    useEffect(() => {
        if (interviews.length === 0) {
            loadUserInterviews();
        }
    }, [interviews.length, loadUserInterviews]);

    const handleAcceptInterview = async (id: string) => {
        try {
            // Update interview status in backend
            await axios.put(`/interview/${id}/status`, { status: 'accepted' });
            // Refresh interviews from database
            await refreshInterviews();
        } catch (error) {
            console.error('Error accepting interview:', error);
        }
    };

    const handleRejectInterview = async (id: string) => {
        try {
            // Update interview status in backend
            await axios.put(`/interview/${id}/status`, { status: 'cancelled' });
            // Refresh interviews from database
            await refreshInterviews();
        } catch (error) {
            console.error('Error rejecting interview:', error);
        }
    };

    const handleCancelInterview = async (id: string) => {
        try {
            // Update interview status in backend
            await axios.put(`/interview/${id}/status`, { status: 'cancelled' });
            // Refresh interviews from database
            await refreshInterviews();
        } catch (error) {
            console.error('Error cancelling interview:', error);
        }
    };

    const handleJoinInterview = (id: string) => {
        // Navigate to the full-screen interview room
        navigate(`/mock-arena/room/${id}`);
    };

    // Filter interviews from database data
    const pendingInterviews = interviews.filter(
        (interview) => interview.status === 'pending'
    );
    
    const acceptedInterviews = interviews.filter(
        (interview) => interview.status === 'accepted'
    );

    const isInterviewTimeNow = (scheduledAt: string) => {
        const now = new Date();
        const interviewTime = new Date(scheduledAt);
        const timeDiff = Math.abs(now.getTime() - interviewTime.getTime());
        return timeDiff <= 15 * 60 * 1000; // Within 15 minutes
    };

    const extractNameFromEmail = (email: string) => {
        const name = email.split('@')[0];
        return name.split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
    };

    const handleSendInvite = async () => {
        if (!formData.email || !formData.date || !formData.time) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        try {
            const extractedName = formData.name || extractNameFromEmail(formData.email);
            const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);
            
            // Send email invitation via backend
            const response = await axios.post('/interview/schedule', {
                recipientEmail: formData.email,
                recipientName: extractedName,
                date: formData.date,
                time: formData.time,
                duration: formData.duration,
                topics: formData.topics,
                description: formData.description,
            });

            if (response.data.success) {
                // Refresh interviews from database instead of local state
                await refreshInterviews();
                
                // Reset form
                setFormData({
                    email: '',
                    date: '',
                    time: '',
                    topics: '',
                    name: '',
                    duration: 60,
                    description: ''
                });
                setShowNewInterviewForm(false);

                alert(`✅ Interview invitation sent successfully to ${formData.email}!\n\nInterview scheduled for ${new Date(scheduledDateTime).toLocaleString()}`);
            } else {
                alert(`❌ Failed to send invitation: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error sending interview invitation:', error);
            alert('❌ Failed to send interview invitation. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return {
        date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
        };
    };

    // Convert database interview format to component format
    const convertToInterviewFormat = (dbInterview: any): Interview => ({
        id: dbInterview.id,
        title: `Mock Interview - ${dbInterview.topics || 'General'}`,
        participant: dbInterview.isInterviewer ? dbInterview.participant_name : dbInterview.interviewer_name,
        scheduledAt: dbInterview.scheduled_at,
        durationMinutes: dbInterview.duration_minutes,
        description: dbInterview.description || '',
        status: dbInterview.status,
        isIncoming: !dbInterview.isInterviewer,
        topics: dbInterview.topics ? dbInterview.topics.split(',').map((t: string) => t.trim()) : [],
        inviteeEmail: dbInterview.isInterviewer ? dbInterview.participant_email : dbInterview.interviewer_email
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mock Interview Arena</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Schedule and manage your mock interviews</p>
                </div>
                <div className="flex space-x-3">
                    <Button 
                        variant={activeTab === 'dashboard' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('dashboard')}
                        icon={<BarChart3 size={16} />}
                    >
                        Dashboard
                    </Button>
                    <Button 
                        variant={activeTab === 'schedule' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('schedule')}
                        icon={<Calendar size={16} />}
                    >
                        Schedule
                    </Button>
                    <Button 
                        variant="primary" 
                        icon={<Plus size={16} />} 
                        onClick={() => setShowNewInterviewForm(!showNewInterviewForm)} 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        Schedule Interview
                    </Button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' ? (
                <InterviewDashboard />
            ) : (
                <div className="space-y-8">
                    {pendingInterviews.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
                          <div className="h-8 w-1 bg-yellow-500 rounded-full mr-3"></div>
                          Pending Interviews
                          <Badge variant="warning" className="ml-3">{pendingInterviews.length}</Badge>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {pendingInterviews.map((interview) => (
                            <InterviewCard
                              key={interview.id}
                              interview={convertToInterviewFormat(interview)}
                              onAccept={handleAcceptInterview}
                              onReject={handleRejectInterview}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {acceptedInterviews.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
                          <div className="h-8 w-1 bg-green-500 rounded-full mr-3"></div>
                          Upcoming Interviews
                          <Badge variant="success" className="ml-3">{acceptedInterviews.length}</Badge>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {acceptedInterviews.map((interview) => {
                            const { date, time } = formatDateTime(interview.scheduled_at);
                            const canJoinNow = isInterviewTimeNow(interview.scheduled_at);
                            
                            return (
                              <Card key={interview.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                                <CardContent className="p-6">
                                  <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {interview.isInterviewer ? 'Interview with' : 'Interview by'}{' '}
                                      {interview.isInterviewer ? interview.participant_name : interview.interviewer_name}
                                    </h3>
                                    <Badge variant={canJoinNow ? 'success' : 'info'}>
                                      {canJoinNow ? 'Ready to Join' : 'Scheduled'}
                                    </Badge>
                                  </div>
                                  
                                  <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                      <User className="h-4 w-4 mr-2" />
                                      <span className="text-sm">
                                        {interview.isInterviewer ? interview.participant_name : interview.interviewer_name}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      <span className="text-sm">{date}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                      <Clock className="h-4 w-4 mr-2" />
                                      <span className="text-sm">{time} ({interview.duration_minutes} mins)</span>
                                    </div>
                                    {interview.topics && (
                                      <div className="flex flex-wrap gap-1 mt-3">
                                        {interview.topics.split(',').map((topic: string, index: number) => (
                                          <Badge key={index} variant="primary" size="sm">
                                            {topic.trim()}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                    <p>{interview.description}</p>
                                  </div>
                                  
                                  <div className="flex space-x-2">
                                    {canJoinNow ? (
                                      <Button
                                        variant="success"
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        onClick={() => handleJoinInterview(interview.id)}
                                      >
                                        Join Interview
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={() => handleJoinInterview(interview.id)}
                                      >
                                        Join Interview
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => handleCancelInterview(interview.id)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {interviews.length === 0 && (
                      <div className="text-center py-16">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No interviews scheduled yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                          Start by scheduling your first mock interview to practice your coding skills with peers.
                        </p>
                        <Button
                          variant="primary"
                          icon={<Plus size={16} />}
                          onClick={() => setShowNewInterviewForm(true)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                          Schedule Your First Interview
                        </Button>
                      </div>
                    )}
                </div>
            )}

            {/* Background Overlay + Modal for Schedule Interview Form */}
            {showNewInterviewForm && (
                <>
                    {/* Semi-transparent background overlay */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setShowNewInterviewForm(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <InterviewForm
                                setShowNewInterviewForm={setShowNewInterviewForm}
                                showNewInterviewForm={showNewInterviewForm}
                                formData={formData}
                                setFormData={setFormData}
                                handleSendInvite={handleSendInvite}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
};

export default MockArena;
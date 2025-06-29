import { BookOpen, Calendar, Clock, Mail, Plus, Send, User, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import Button from "../ui/Button";

interface InterviewFormProps {
    setShowNewInterviewForm: (show: boolean) => void;
    showNewInterviewForm: boolean;
    formData: {
        email: string;
        date: string;
        time: string;
        topics: string;
        name: string;
        duration: number;
        description: string;
    };
    setFormData: (data: any) => void;
    handleSendInvite: () => void;
    isLoading?: boolean;
}

const InterviewForm = ({
    setShowNewInterviewForm,
    showNewInterviewForm,
    formData,
    setFormData,
    handleSendInvite,
    isLoading = false
}: InterviewFormProps) => {
    return (
        <Card className="bg-white dark:bg-gray-800 shadow-2xl border-0 transition-all duration-300 ease-in-out z-10">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule New Interview
                </h2>
                
                <X className="text-black dark:text-white cursor-pointer" size={16} onClick={() => setShowNewInterviewForm(!showNewInterviewForm)} />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Invitee Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="colleague@example.com"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Will be extracted from email if not provided"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="topics" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <BookOpen className="inline h-4 w-4 mr-1" />
                    Topics
                  </label>
                  <input
                    type="text"
                    id="topics"
                    placeholder="Arrays, Dynamic Programming, System Design"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    value={formData.topics}
                    onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple topics with commas</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Time *
                  </label>
                  <input
                    type="time"
                    id="time"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    id="duration"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Additional details about the interview session..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="primary"
                onClick={handleSendInvite}
                icon={<Send size={16} />}
                isLoading={isLoading}
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </CardContent>
        </Card>
    );
};

export default InterviewForm;
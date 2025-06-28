import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import Badge from '../ui/Badge';
import { Card, CardContent, CardHeader, CardFooter } from "../ui/Card";
import Button from '../ui/Button';
import { Interview } from '../../types';

interface InterviewCardProps {
  interview: Interview;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onJoin?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const InterviewCard = ({
  interview,
  onAccept,
  onReject,
  onJoin,
  onCancel,
}: InterviewCardProps) => {
  const statusVariant = {
    pending: 'warning',
    accepted: 'info',
    completed: 'success',
    cancelled: 'default',
  }[interview.status] as 'warning' | 'info' | 'success' | 'default';

  const statusLabel = {
    pending: 'Pending',
    accepted: 'Accepted',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }[interview.status];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="flex flex-col h-full pt-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {interview.title}
          </h3>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
        <div className="flex items-center mb-3 text-gray-600 dark:text-gray-300">
          <User className="h-4 w-4 mr-2" />
          <span className="text-sm">{interview.participant}</span>
        </div>
        <div className="flex items-center mb-3 text-gray-600 dark:text-gray-300">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">{formatDate(interview.scheduledAt)}</span>
        </div>
        <div className="flex items-center mb-4 text-gray-600 dark:text-gray-300">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm">{formatTime(interview.scheduledAt)} ({interview.durationMinutes} mins)</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow">
          <p>{interview.description}</p>
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-200 dark:border-gray-700">
        <div className="flex w-full space-x-2">
          {interview.status === 'pending' && interview.isIncoming && (
            <>
              <Button
                variant="success"
                className="flex-1"
                onClick={() => onAccept?.(interview.id)}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => onReject?.(interview.id)}
              >
                Decline
              </Button>
            </>
          )}
          {interview.status === 'accepted' && (
            <>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => onJoin?.(interview.id)}
              >
                Join
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onCancel?.(interview.id)}
              >
                Cancel
              </Button>
            </>
          )}
          {interview.status === 'completed' && (
            <Button variant="secondary" className="w-full">
              View Summary
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Code, 
  Globe, 
  Download, 
  Trash2, 
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/authContext';
import { useTheme } from '../../contexts/themeContext';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import axios from 'axios';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  twitter: string;
  phone: string;
  timezone: string;
  birthDate: string;
  isPublic: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  interviewReminders: boolean;
  weeklyProgress: boolean;
  newFeatures: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showProgress: boolean;
  showActivity: boolean;
  allowMessages: boolean;
  dataCollection: boolean;
}

interface CodePreferences {
  defaultLanguage: string;
  fontSize: number;
  tabSize: number;
  theme: string;
  autoComplete: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    phone: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    birthDate: '',
    isPublic: true
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    interviewReminders: true,
    weeklyProgress: true,
    newFeatures: false,
    marketingEmails: false,
    pushNotifications: true,
    soundEnabled: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showProgress: true,
    showActivity: true,
    allowMessages: true,
    dataCollection: true
  });

  // Code preferences
  const [codePrefs, setCodePrefs] = useState<CodePreferences>({
    defaultLanguage: 'python',
    fontSize: 14,
    tabSize: 4,
    theme: 'dark',
    autoComplete: true,
    lineNumbers: true,
    wordWrap: false,
    minimap: false
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/user/settings');
      const settings = response.data;
      
      if (settings.profile) setProfile({ ...profile, ...settings.profile });
      if (settings.notifications) setNotifications({ ...notifications, ...settings.notifications });
      if (settings.privacy) setPrivacy({ ...privacy, ...settings.privacy });
      if (settings.codePrefs) setCodePrefs({ ...codePrefs, ...settings.codePrefs });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaveStatus('saving');
      await axios.put('/user/settings', {
        profile,
        notifications,
        privacy,
        codePrefs
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const exportData = async () => {
    try {
      const response = await axios.get('/user/export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deepcode-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete('/user/account');
      await logout();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'coding', label: 'Coding', icon: Code },
    { id: 'data', label: 'Data & Privacy', icon: Globe }
  ];

  const renderSaveButton = () => (
    <div className="flex items-center space-x-3">
      {saveStatus === 'saved' && (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <Check size={16} className="mr-1" />
          <span className="text-sm">Saved</span>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center text-red-600 dark:text-red-400">
          <X size={16} className="mr-1" />
          <span className="text-sm">Error saving</span>
        </div>
      )}
      <Button
        onClick={saveSettings}
        variant="primary"
        isLoading={saveStatus === 'saving'}
        icon={<Save size={16} />}
      >
        Save Changes
      </Button>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="San Francisco, CA"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Birth Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={profile.birthDate}
                onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bio
        </label>
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          rows={4}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Social Links
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website
            </label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GitHub
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={profile.github}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LinkedIn
            </label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={profile.linkedin}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Twitter
            </label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={profile.twitter}
                onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="@username"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Notifications
        </h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive notifications via email' },
            { key: 'interviewReminders', label: 'Interview reminders', desc: 'Get reminded about upcoming interviews' },
            { key: 'weeklyProgress', label: 'Weekly progress', desc: 'Weekly summary of your coding progress' },
            { key: 'newFeatures', label: 'New features', desc: 'Updates about new platform features' },
            { key: 'marketingEmails', label: 'Marketing emails', desc: 'Promotional content and tips' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[key as keyof NotificationSettings] as boolean}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          App Notifications
        </h3>
        <div className="space-y-4">
          {[
            { key: 'pushNotifications', label: 'Push notifications', desc: 'Receive push notifications in browser' },
            { key: 'soundEnabled', label: 'Sound notifications', desc: 'Play sound for notifications' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[key as keyof NotificationSettings] as boolean}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Visibility
        </h3>
        <div className="space-y-3">
          {[
            { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
            { value: 'private', label: 'Private', desc: 'Only you can view your profile' },
            { value: 'friends', label: 'Friends only', desc: 'Only your connections can view' }
          ].map(({ value, label, desc }) => (
            <label key={value} className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="profileVisibility"
                value={value}
                checked={privacy.profileVisibility === value}
                onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value as any })}
                className="mr-3 text-indigo-600"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Information Sharing
        </h3>
        <div className="space-y-4">
          {[
            { key: 'showEmail', label: 'Show email address', desc: 'Display your email on your public profile' },
            { key: 'showProgress', label: 'Show coding progress', desc: 'Display your problem-solving statistics' },
            { key: 'showActivity', label: 'Show recent activity', desc: 'Display your recent coding activity' },
            { key: 'allowMessages', label: 'Allow messages', desc: 'Let other users send you messages' },
            { key: 'dataCollection', label: 'Analytics data collection', desc: 'Help improve the platform with usage data' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy[key as keyof PrivacySettings] as boolean}
                  onChange={(e) => setPrivacy({ ...privacy, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Theme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              theme === 'light' 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">Light Mode</span>
              {theme === 'light' && <Check className="w-5 h-5 text-indigo-600" />}
            </div>
            <div className="w-full h-20 bg-white border border-gray-200 rounded flex">
              <div className="w-1/4 bg-gray-100"></div>
              <div className="flex-1 p-2">
                <div className="h-2 bg-gray-300 rounded mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => theme === 'light' && toggleTheme()}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              theme === 'dark' 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
              {theme === 'dark' && <Check className="w-5 h-5 text-indigo-600" />}
            </div>
            <div className="w-full h-20 bg-gray-800 border border-gray-700 rounded flex">
              <div className="w-1/4 bg-gray-700"></div>
              <div className="flex-1 p-2">
                <div className="h-2 bg-gray-600 rounded mb-1"></div>
                <div className="h-2 bg-gray-500 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Language & Region
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Timezone
            </label>
            <select 
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Asia/Kolkata">India (IST)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCodingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Editor Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Language
            </label>
            <select 
              value={codePrefs.defaultLanguage}
              onChange={(e) => setCodePrefs({ ...codePrefs, defaultLanguage: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Editor Theme
            </label>
            <select 
              value={codePrefs.theme}
              onChange={(e) => setCodePrefs({ ...codePrefs, theme: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="monokai">Monokai</option>
              <option value="github">GitHub</option>
              <option value="dracula">Dracula</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Font Size
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={codePrefs.fontSize}
              onChange={(e) => setCodePrefs({ ...codePrefs, fontSize: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {codePrefs.fontSize}px
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tab Size
            </label>
            <select 
              value={codePrefs.tabSize}
              onChange={(e) => setCodePrefs({ ...codePrefs, tabSize: parseInt(e.target.value) })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>8 spaces</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Editor Features
        </h3>
        <div className="space-y-4">
          {[
            { key: 'autoComplete', label: 'Auto-completion', desc: 'Enable intelligent code completion' },
            { key: 'lineNumbers', label: 'Line numbers', desc: 'Show line numbers in editor' },
            { key: 'wordWrap', label: 'Word wrap', desc: 'Wrap long lines of code' },
            { key: 'minimap', label: 'Minimap', desc: 'Show code minimap for navigation' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={codePrefs[key as keyof CodePreferences] as boolean}
                  onChange={(e) => setCodePrefs({ ...codePrefs, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h3>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Export Your Data
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Download a copy of all your data including profile, progress, and interview history.
                  </p>
                </div>
                <Button
                  onClick={exportData}
                  variant="outline"
                  icon={<Download size={16} />}
                >
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                    Delete Account
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="danger"
                  icon={<Trash2 size={16} />}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Usage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">584</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Problems Solved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">12</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Interviews Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">2.4 MB</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Data Size</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'coding':
        return renderCodingTab();
      case 'data':
        return renderDataTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account preferences and privacy settings
          </p>
        </div>
        {renderSaveButton()}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={20} className="mr-3" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          <Card>
            <CardContent className="p-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                renderTabContent()
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Account
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete your account? This will permanently remove:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Your profile and personal information</li>
                <li>All coding progress and statistics</li>
                <li>Interview history and recordings</li>
                <li>Saved code and solutions</li>
              </ul>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                This action cannot be undone.
              </p>
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="danger"
                  onClick={deleteAccount}
                  className="flex-1"
                >
                  Yes, Delete Account
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Settings;
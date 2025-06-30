import React from 'react';
import { Rnd } from 'react-rnd';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff, 
  PhoneOff,
  Maximize2,
  Minimize2,
  User
} from 'lucide-react';

interface VideoCallWindowProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  remoteScreenSharing: boolean;
  remoteUsername: string | null;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

const VideoCallWindow: React.FC<VideoCallWindowProps> = ({
  localVideoRef,
  remoteVideoRef,
  isConnected,
  isMuted,
  isVideoOff,
  isScreenSharing,
  remoteScreenSharing,
  remoteUsername,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
}) => {
  const [isMinimized, setIsMinimized] = React.useState(false);

  // Ensure videos continue playing and maintain their streams
  React.useEffect(() => {
    const ensureVideoPlaying = (videoElement: HTMLVideoElement | null) => {
      if (videoElement && videoElement.srcObject) {
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        
        if (videoElement.paused) {
          videoElement.play().catch(error => {
            console.warn('Could not play video:', error);
          });
        }
      }
    };

    // Set up remote video
    if (remoteVideoRef.current) {
      const remoteVideo = remoteVideoRef.current;
      remoteVideo.muted = false;
      remoteVideo.volume = 1.0;
      ensureVideoPlaying(remoteVideo);
    }

    // Set up local video
    if (localVideoRef.current) {
      const localVideo = localVideoRef.current;
      localVideo.muted = true; // Always mute local video to prevent feedback
      ensureVideoPlaying(localVideo);
    }
  }, [remoteVideoRef.current?.srcObject, localVideoRef.current?.srcObject, isMinimized]);

  // Handle minimize/maximize size changes
  const handleMinimizeToggle = (minimize: boolean) => {
    setIsMinimized(minimize);
    
    // Ensure videos keep playing after state change
    setTimeout(() => {
      if (remoteVideoRef.current && remoteVideoRef.current.paused) {
        remoteVideoRef.current.play().catch(console.warn);
      }
      if (localVideoRef.current && localVideoRef.current.paused) {
        localVideoRef.current.play().catch(console.warn);
      }
    }, 100);
  };

  return (
    <Rnd
      default={{
        x: window.innerWidth - 420,
        y: 100,
        width: isMinimized ? 280 : 400,
        height: isMinimized ? 180 : 320,
      }}
      size={{
        width: isMinimized ? 280 : 400,
        height: isMinimized ? 180 : 320,
      }}
      minWidth={isMinimized ? 250 : 350}
      minHeight={isMinimized ? 150 : 280}
      maxWidth={600}
      maxHeight={500}
      bounds="window"
      className="z-50"
      enableResizing={!isMinimized}
    >
      <div className="bg-black/95 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl overflow-hidden h-full flex flex-col">
        
        {/* Video Container */}
        <div className="relative flex-1 bg-slate-900">
          {/* Remote Video - Always the main video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover"
            style={{ 
              display: 'block',
              width: '100%',
              height: '100%'
            }}
          />
          
          {/* Remote user info */}
          {remoteUsername && !isMinimized && (
            <div className="absolute bottom-3 left-3 bg-black/80 px-3 py-1 rounded-lg">
              <span className="text-white text-sm font-medium flex items-center">
                <User className="w-3 h-3 mr-1" />
                {remoteUsername}
              </span>
            </div>
          )}

          {/* Screen sharing indicator */}
          {remoteScreenSharing && (
            <div className="absolute top-12 left-2 bg-blue-600/90 px-2 py-1 rounded-lg">
              <span className="text-white text-xs font-medium flex items-center">
                <Monitor className="w-3 h-3 mr-1" />
                Screen Sharing
              </span>
            </div>
          )}
          
          {/* Local Video - Position changes based on minimized state */}
          <div 
            className={`absolute bg-slate-800 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg ${
              isMinimized 
                ? 'bottom-2 right-2 w-16 h-12' 
                : 'bottom-3 right-3 w-24 h-18'
            }`}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ 
                display: 'block',
                width: '100%',
                height: '100%'
              }}
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
                <VideoOff className={`text-white/60 ${isMinimized ? 'w-3 h-3' : 'w-5 h-5'}`} />
              </div>
            )}
            {isScreenSharing && !isMinimized && (
              <div className="absolute -top-6 left-0 bg-blue-600 px-1 py-0.5 rounded text-xs text-white">
                Screen
              </div>
            )}
          </div>

          {/* Minimize/Maximize button */}
          <button
            onClick={() => handleMinimizeToggle(!isMinimized)}
            className="absolute top-2 right-2 p-2 bg-black/80 hover:bg-black text-white rounded-lg transition-all z-10"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          {/* Connection status indicator */}
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/80 px-2 py-1 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {!isMinimized && (
              <span className="text-white text-xs font-medium">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            )}
          </div>

          {/* Connection loading overlay */}
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
              <div className="text-center text-white">
                <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full mx-auto mb-2" />
                <p className="text-xs">Connecting...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls - Only show when maximized */}
        {!isMinimized && (
          <div className="flex items-center justify-center gap-3 p-4 bg-black/60 border-t border-white/10 flex-shrink-0">
            <button
              onClick={onToggleMute}
              className={`p-3 rounded-full transition-all ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={onToggleVideo}
              className={`p-3 rounded-full transition-all ${
                isVideoOff
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>

            <button
              onClick={onToggleScreenShare}
              className={`p-3 rounded-full transition-all ${
                isScreenSharing
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
            >
              {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </button>

            <button
              onClick={onEndCall}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all ml-2"
              title="End call"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Rnd>
  );
};

export default VideoCallWindow;
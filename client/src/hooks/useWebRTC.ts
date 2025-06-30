import { useEffect, useRef, useState, useCallback, SetStateAction } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  remoteScreenSharing: boolean;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  startCall: () => void;
  endCall: () => void;
  remoteUsername: string | null;
}

export const useWebRTC = (roomId: string, username: string): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteScreenSharing, setRemoteScreenSharing] = useState(false);
  const [remoteUsername, setRemoteUsername] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const isInitiatorRef = useRef<boolean>(false);
  const remoteUserIdRef = useRef<string | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  // Initialize WebRTC peer connection with optimized settings
  const initializePeerConnection = useCallback(() => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10,
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log('Sending ICE candidate');
        socketRef.current.emit('signal', {
          type: 'ice-candidate',
          candidate: event.candidate,
          roomId,
          targetUserId: remoteUserIdRef.current,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      const [remoteStream] = event.streams;
      console.log('Remote stream tracks:', remoteStream.getTracks().map(t => `${t.kind}: enabled=${t.enabled}, muted=${t.muted}`));
      
      // Process audio tracks for better quality
      remoteStream.getAudioTracks().forEach(track => {
        console.log(`Remote audio track: ${track.label}, enabled: ${track.enabled}, muted: ${track.muted}, readyState: ${track.readyState}`);
        track.enabled = true;
      });
      
      setRemoteStream(remoteStream);
      setIsConnected(true);
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setIsConnected(true);
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed') {
        setIsConnected(false);
        setRemoteStream(null);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === 'connected' || 
          peerConnection.iceConnectionState === 'completed') {
        setIsConnected(true);
      }
    };

    // Add data channel for better connectivity
    const dataChannel = peerConnection.createDataChannel('test', { ordered: true });
    dataChannel.onopen = () => console.log('Data channel opened');
    dataChannel.onclose = () => console.log('Data channel closed');

    peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onopen = () => console.log('Received data channel opened');
      channel.onclose = () => console.log('Received data channel closed');
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, [roomId]);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const socket = io('http://localhost:8000', {
      transports: ['websocket'],
      upgrade: false,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to signaling server with ID:', socket.id);
      socket.emit('join-room', { roomId, username });
    });

    socket.on('signal', async (data: { type: string; fromUserId: string | null; offer: RTCSessionDescriptionInit; answer: RTCSessionDescriptionInit; candidate: RTCIceCandidateInit | undefined; }) => {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      console.log('Received signal:', data.type, 'from:', data.fromUserId);

      try {
        if (data.type === 'offer') {
          console.log('Processing offer');
          remoteUserIdRef.current = data.fromUserId;
          
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
          
          const answer = await peerConnection.createAnswer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          
          await peerConnection.setLocalDescription(answer);
          
          socket.emit('signal', {
            type: 'answer',
            answer,
            roomId,
            targetUserId: data.fromUserId,
          });
          
          console.log('Sent answer');
        } else if (data.type === 'answer') {
          console.log('Processing answer');
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === 'ice-candidate') {
          console.log('Processing ICE candidate');
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (error) {
        console.error('Error handling signal:', error);
      }
    });

    socket.on('user-joined', async (data: { username: SetStateAction<string | null>; userId: string | null; }) => {
      console.log('User joined:', data.username, data.userId);
      remoteUserIdRef.current = data.userId;
      setRemoteUsername(data.username);
      isInitiatorRef.current = true;
      
      // Wait a bit for the other peer to be ready
      setTimeout(async () => {
        const peerConnection = peerConnectionRef.current;
        if (peerConnection && localStreamRef.current) {
          try {
            console.log('Creating offer as initiator');
            const offer = await peerConnection.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            
            await peerConnection.setLocalDescription(offer);
            
            socket.emit('signal', {
              type: 'offer',
              offer,
              roomId,
              targetUserId: data.userId,
            });
            
            console.log('Sent offer to:', data.userId);
          } catch (error) {
            console.error('Error creating offer:', error);
          }
        }
      }, 1500);
    });

    socket.on('room-users', (users: string | any[]) => {
      console.log('Existing users in room:', users.length);
      if (users.length > 0) {
        isInitiatorRef.current = false;
        remoteUserIdRef.current = users[0].socketId;
        setRemoteUsername(users[0].username);
        console.log('Not initiator, waiting for offer from:', users[0].socketId);
      }
    });

    socket.on('user-left', (data: { userId: string | null; }) => {
      console.log('User left:', data.userId);
      if (data.userId === remoteUserIdRef.current) {
        setRemoteStream(null);
        setIsConnected(false);
        setRemoteUsername(null);
        setRemoteScreenSharing(false);
        remoteUserIdRef.current = null;
      }
    });

    socket.on('screen-share-started', (data: { userId: string | null; }) => {
      console.log('Remote user started screen sharing:', data.userId);
      if (data.userId === remoteUserIdRef.current) {
        setRemoteScreenSharing(true);
      }
    });

    socket.on('screen-share-stopped', (data: { userId: string | null; }) => {
      console.log('Remote user stopped screen sharing:', data.userId);
      if (data.userId === remoteUserIdRef.current) {
        setRemoteScreenSharing(false);
      }
    });

    return socket;
  }, [roomId, username]);

  // Get user media with high-quality audio settings
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        },
      });
      
      console.log('Got user media with tracks:', stream.getTracks().map(t => `${t.kind}: ${t.label} (enabled: ${t.enabled})`));
      
      // Store original video track for screen share toggle
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        originalVideoTrackRef.current = videoTrack;
      }
      
      // Ensure all tracks are enabled
      stream.getTracks().forEach(track => {
        track.enabled = true;
        console.log(`Track ${track.kind} settings:`, {
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label
        });
      });
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      // Fallback with basic settings if advanced settings fail
      try {
        console.log('Trying fallback audio settings...');
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        
        const videoTrack = fallbackStream.getVideoTracks()[0];
        if (videoTrack) {
          originalVideoTrackRef.current = videoTrack;
        }
        
        setLocalStream(fallbackStream);
        localStreamRef.current = fallbackStream;
        return fallbackStream;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }, []);

  // Start call
  const startCall = useCallback(async () => {
    try {
      const stream = await getUserMedia();
      const peerConnection = initializePeerConnection();
      
      // Add local stream tracks to peer connection with optimized settings
      stream.getTracks().forEach((track) => {
        console.log('Adding track to peer connection:', track.kind, track.label, 'enabled:', track.enabled);
        
        const sender = peerConnection.addTrack(track, stream);
        
        // Configure sender parameters for better audio quality
        if (track.kind === 'audio' && sender.getParameters) {
          const params = sender.getParameters();
          if (params.encodings && params.encodings.length > 0) {
            // Optimize audio encoding
            params.encodings[0].maxBitrate = 128000; // 128 kbps for high quality audio
            params.encodings[0].priority = 'high';
            sender.setParameters(params).catch(console.warn);
          }
        }
        
        // Ensure the track is enabled on the sender side
        if (sender.track) {
          sender.track.enabled = true;
        }
      });

      initializeSocket();
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Failed to access camera/microphone. Please check permissions and try again.');
    }
  }, [getUserMedia, initializePeerConnection, initializeSocket]);

  // End call
  const endCall = useCallback(() => {
    console.log('Ending call');
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId });
      socketRef.current.disconnect();
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setRemoteScreenSharing(false);
    setRemoteUsername(null);
    localStreamRef.current = null;
    peerConnectionRef.current = null;
    socketRef.current = null;
    isInitiatorRef.current = false;
    remoteUserIdRef.current = null;
    originalVideoTrackRef.current = null;
  }, [roomId]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log('Audio track toggled - enabled:', audioTrack.enabled);
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        console.log('Video track toggled - enabled:', videoTrack.enabled);
      }
    }
  }, []);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (!peerConnectionRef.current || !socketRef.current) return;

    try {
      if (!isScreenSharing) {
        console.log('Starting screen share');
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        
        // Replace video track
        const videoSender = peerConnectionRef.current
          .getSenders()
          .find((s) => s.track?.kind === 'video');

        if (videoSender && videoTrack) {
          await videoSender.replaceTrack(videoTrack);
        }

        // Handle screen share end
        videoTrack.onended = () => {
          console.log('Screen share ended');
          if (originalVideoTrackRef.current && peerConnectionRef.current) {
            const videoSender = peerConnectionRef.current
              .getSenders()
              .find((s) => s.track?.kind === 'video');
              
            if (videoSender) {
              videoSender.replaceTrack(originalVideoTrackRef.current);
            }
          }
          setIsScreenSharing(false);
          if (socketRef.current) {
            socketRef.current.emit('screen-share-stop', { roomId });
          }
        };

        setIsScreenSharing(true);
        socketRef.current.emit('screen-share-start', { roomId });
      } else {
        console.log('Stopping screen share');
        if (originalVideoTrackRef.current) {
          const videoSender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track?.kind === 'video');
            
          if (videoSender) {
            await videoSender.replaceTrack(originalVideoTrackRef.current);
          }
        }
        setIsScreenSharing(false);
        socketRef.current.emit('screen-share-stop', { roomId });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [isScreenSharing, roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    remoteStream,
    isConnected,
    isMuted,
    isVideoOff,
    isScreenSharing,
    remoteScreenSharing,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    startCall,
    endCall,
    remoteUsername,
  };
};
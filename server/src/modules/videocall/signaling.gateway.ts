import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';

interface JoinRoomData {
  roomId: string;
  username: string;
}

interface SignalData {
  type: 'offer' | 'answer' | 'ice-candidate' | 'screen-share-start' | 'screen-share-stop';
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  roomId: string;
  targetUserId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomService: RoomService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove user from all rooms and notify other users
    const userRooms = this.roomService.getUserRooms(client.id);
    userRooms.forEach(roomId => {
      this.roomService.leaveRoom(client.id, roomId);
      client.to(roomId).emit('user-left', { userId: client.id });
    });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: JoinRoomData,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, username } = data;
    
    console.log(`User ${username} (${client.id}) joining room ${roomId}`);
    
    // Get existing users before adding the new user
    const existingUsers = this.roomService.getRoomUsers(roomId)
      .filter(user => user.socketId !== client.id);
    
    // Add user to room
    this.roomService.joinRoom(client.id, roomId, username);
    client.join(roomId);
    
    // Send existing users list to the new user first
    client.emit('room-users', existingUsers);
    
    // Then notify existing users about the new user (this triggers offer creation)
    client.to(roomId).emit('user-joined', {
      userId: client.id,
      username,
    });
    
    console.log(`Room ${roomId} now has ${this.roomService.getRoomUsers(roomId).length} users`);
  }

  @SubscribeMessage('signal')
  handleSignal(
    @MessageBody() data: SignalData,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, targetUserId, ...signalData } = data;
    
    console.log(`Relaying signal of type ${data.type} in room ${roomId} from ${client.id}`);
    
    if (targetUserId) {
      // Send to specific user
      client.to(targetUserId).emit('signal', {
        ...signalData,
        fromUserId: client.id,
      });
    } else {
      // Broadcast the signal to all other users in the room
      client.to(roomId).emit('signal', {
        ...signalData,
        fromUserId: client.id,
      });
    }
  }

  @SubscribeMessage('screen-share-start')
  handleScreenShareStart(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    console.log(`User ${client.id} started screen sharing in room ${roomId}`);
    
    // Notify other users in the room
    client.to(roomId).emit('screen-share-started', {
      userId: client.id,
    });
  }

  @SubscribeMessage('screen-share-stop')
  handleScreenShareStop(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    console.log(`User ${client.id} stopped screen sharing in room ${roomId}`);
    
    // Notify other users in the room
    client.to(roomId).emit('screen-share-stopped', {
      userId: client.id,
    });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    
    console.log(`User ${client.id} leaving room ${roomId}`);
    
    // Remove user from room
    this.roomService.leaveRoom(client.id, roomId);
    client.leave(roomId);
    
    // Notify other users
    client.to(roomId).emit('user-left', { userId: client.id });
  }
}
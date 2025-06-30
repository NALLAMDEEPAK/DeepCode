import { Injectable } from '@nestjs/common';

interface User {
  socketId: string;
  username: string;
  joinedAt: Date;
}

interface Room {
  id: string;
  users: Map<string, User>;
  createdAt: Date;
}

@Injectable()
export class RoomService {
  private rooms = new Map<string, Room>();
  private userRooms = new Map<string, Set<string>>(); // socketId -> Set of roomIds

  /**
   * Join a user to a room
   */
  joinRoom(socketId: string, roomId: string, username: string): void {
    // Create room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        createdAt: new Date(),
      });
    }

    const room = this.rooms.get(roomId);
    const user: User = {
      socketId,
      username,
      joinedAt: new Date(),
    };

    // Add user to room
    room?.users.set(socketId, user);

    // Track user's rooms
    if (!this.userRooms.has(socketId)) {
      this.userRooms.set(socketId, new Set());
    }
    this.userRooms.get(socketId)?.add(roomId);

    console.log(`User ${username} joined room ${roomId}. Room size: ${room?.users.size}`);
  }

  /**
   * Remove a user from a room
   */
  leaveRoom(socketId: string, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      const user = room.users.get(socketId);
      room.users.delete(socketId);

      console.log(`User ${user?.username || socketId} left room ${roomId}. Room size: ${room.users.size}`);

      // Clean up empty room
      if (room.users.size === 0) {
        this.rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }
    }

    // Remove room from user's room list
    const userRoomsSet = this.userRooms.get(socketId);
    if (userRoomsSet) {
      userRoomsSet.delete(roomId);
      if (userRoomsSet.size === 0) {
        this.userRooms.delete(socketId);
      }
    }
  }

  /**
   * Get all users in a room
   */
  getRoomUsers(roomId: string): User[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users.values()) : [];
  }

  /**
   * Get all rooms a user is in
   */
  getUserRooms(socketId: string): string[] {
    const userRoomsSet = this.userRooms.get(socketId);
    return userRoomsSet ? Array.from(userRoomsSet) : [];
  }

  /**
   * Check if a room exists
   */
  roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  /**
   * Get room information
   */
  getRoomInfo(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get all active rooms (for debugging/monitoring)
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Get total number of active rooms
   */
  getActiveRoomsCount(): number {
    return this.rooms.size;
  }

  /**
   * Get total number of connected users
   */
  getTotalUsersCount(): number {
    return Array.from(this.rooms.values()).reduce(
      (total, room) => total + room.users.size,
      0,
    );
  }
}
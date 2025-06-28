import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface GoogleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Validates and processes Google OAuth user data
   * In a real application, you might want to save user data to a database
   */
  async validateGoogleUser(googleUser: GoogleUser): Promise<any> {
    const { id, email, firstName, lastName, picture } = googleUser;
    
    // Here you would typically:
    // 1. Check if user exists in your database
    // 2. Create new user if they don't exist
    // 3. Update existing user data if needed
    // For now, we'll just return the user data
    
    const user = {
      googleId: id,
      email,
      firstName,
      lastName,
      picture,
    };

    return user;
  }

  /**
   * Generates JWT token for authenticated user
   */
  async generateJwtToken(user: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.googleId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Validates JWT token and returns user data
   */
  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    // Here you would typically fetch user from database using payload.sub
    // For now, we'll return the payload data
    return {
      googleId: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      picture: payload.picture,
    };
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract JWT from httpOnly cookie (primary method)
        (request: Request) => {
          const token = request?.cookies?.['auth-token'];
          if (token) {
            console.log(`🍪 JWT extracted from cookie for: ${request.url}`);
          }
          return token;
        },
        // Fallback to Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '',
      // Add passReqToCallback to access request object
      passReqToCallback: false,
    });
  }

  /**
   * Validates JWT payload and returns user data
   */
  async validate(payload: JwtPayload) {
    try {
      console.log(`🔍 Validating JWT for user: ${payload.email}`);
      
      const user = await this.authService.validateJwtPayload(payload);
      if (!user) {
        console.log(`❌ User not found for payload: ${payload.email}`);
        throw new UnauthorizedException('User not found');
      }
      
      console.log(`✅ JWT validation successful for: ${user.email}`);
      return user;
    } catch (error) {
      console.log(`❌ JWT validation failed:`, error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
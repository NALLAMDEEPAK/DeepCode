import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const callbackURL = process.env.NODE_ENV === 'production'
      ? 'https://api.deepcode-server.xyz/auth/google/callback'
      : process.env.CALLBACK_URL ?? "http://localhost:8000/auth/google/callback";

    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.SECRET_GOOGLE_CLIENT,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: false
    } as StrategyOptions);
  }

  /**
   * Validates Google OAuth response and extracts user data
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    const user = {
      id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };

    done(null, user);
  }
}
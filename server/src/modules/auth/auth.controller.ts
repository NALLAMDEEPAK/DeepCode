import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Initiates Google OAuth flow
   * Redirects user to Google's OAuth consent screen
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // This route initiates the Google OAuth flow
    // The actual redirect is handled by Passport
  }

  /**
   * Handles Google OAuth callback
   * Processes successful authentication and redirects to frontend
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      // User data is attached to req.user by GoogleStrategy
      const user = await this.authService.validateGoogleUser(req.user as any);
      
      // Generate JWT token
      const token = await this.authService.generateJwtToken(user);
      
      // Set JWT as httpOnly cookie for security
      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/success`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error`);
    }
  }

  /**
   * Returns current user data if authenticated
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request) {
    return {
      user: req.user,
      message: 'User authenticated successfully',
    };
  }

  /**
   * Logs out user by clearing the auth cookie
   */
  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('auth-token');
    return res.json({ message: 'Logged out successfully' });
  }
}
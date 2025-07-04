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
      
      // Determine if we're in production
      const isProduction = process.env.STAGE === 'Production';
      
      // Set JWT as httpOnly cookie for security
      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: isProduction, // Only secure in production
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production, 'lax' for local
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        domain: isProduction ? '.deepcode-server.xyz' : undefined,
        path: '/',
      });

      console.log(`🍪 Auth cookie set for ${user.email} (production: ${isProduction})`);

      const frontendUrl = process.env.PROD_FRONTEND_URL ?? process.env.DEV_FRONTEND_URL;
      res.redirect(`${frontendUrl}/auth/success`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.PROD_FRONTEND_URL ?? process.env.DEV_FRONTEND_URL;
      res.redirect(`${frontendUrl}/auth/error`);
    }
  }

  /**
   * Returns current user data if authenticated
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: Request) {
    console.log(`✅ Auth check successful for user: ${(req.user as any)?.email}`);
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
    const isProduction = process.env.STAGE === 'Production';
    
    res.clearCookie('auth-token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? '.deepcode-server.xyz' : undefined,
      path: '/',
    });
    
    console.log(`🍪 Auth cookie cleared (production: ${isProduction})`);
    return res.json({ message: 'Logged out successfully' });
  }
}
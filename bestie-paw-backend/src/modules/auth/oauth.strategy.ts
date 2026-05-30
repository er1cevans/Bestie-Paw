import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from '@nicokaiser/passport-apple';
import { env } from '../../config/env';

const configureGoogle = () => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL
      },
      (_accessToken, _refreshToken, profile: GoogleProfile, done) => {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Google account email not available'));
        }

        const displayName = profile.displayName || email.split('@')[0];
        return done(null, { email, displayName, provider: 'google' });
      }
    )
  );
};

const configureApple = () => {
  if (
    !env.APPLE_CLIENT_ID ||
    !env.APPLE_TEAM_ID ||
    !env.APPLE_KEY_ID ||
    !env.APPLE_PRIVATE_KEY_PATH ||
    !env.APPLE_CALLBACK_URL
  ) {
    return;
  }

  passport.use(
    new AppleStrategy(
      {
        clientID: env.APPLE_CLIENT_ID,
        teamID: env.APPLE_TEAM_ID,
        keyID: env.APPLE_KEY_ID,
        callbackURL: env.APPLE_CALLBACK_URL,
        privateKeyPath: env.APPLE_PRIVATE_KEY_PATH
      },
      (
        _accessToken: string,
        _refreshToken: string,
        _idToken: string,
        profile: any,
        done: (error: Error | null, user?: unknown) => void
      ) => {
        const email = profile?.email;
        if (!email) {
          return done(new Error('Apple account email not available'));
        }

        const name = profile?.name
          ? `${profile.name.firstName ?? ''}${profile.name.lastName ?? ''}`.trim()
          : '';
        const displayName = name || email.split('@')[0];
        return done(null, { email, displayName, provider: 'apple' });
      }
    )
  );
};

configureGoogle();
configureApple();

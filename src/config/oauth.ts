import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import { type Application } from 'express';

export const initOAuth = (app: Application): void => {
  const key = process.env.JWT_SECRET || 'fallback-secret';
  const maxAge = 1000 * 60 * 60 * 24 * 30; // 30 hari dalam milidetik

  // 1. Konfigurasi Session (Pengganti gorilla/sessions)
  app.use(
    session({
      secret: key,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: maxAge,
        path: '/',
        httpOnly: true,
        // Di Go: os.Getenv("GIN_MODE") == "release"
        secure: process.env.NODE_ENV === 'production',
      },
    })
  );

  // 2. Inisialisasi Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // 3. Konfigurasi Google Provider (Pengganti goth/providers/google)
  // ... import lainnya

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || '',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
                scope: ['email', 'profile'],
            },
            (_accessToken, _refreshToken, profile, done) => {
            // 1. Ambil email dari array emails Google
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';

            // 2. Buat objek yang sesuai dengan interface Express.User kita
            const user = {
                id: profile.id,
                email: email,
            };

            // 3. Sekarang 'user' sudah punya property 'id' dan 'email', 
            // TypeScript tidak akan protes lagi.
            return done(null, user);
            }
        )
    );

    // Update juga serialization-nya agar lebih aman
    passport.serializeUser((user, done) => {
    done(null, user);
    });

    // Gunakan Express.User di sini agar konsisten
    passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
    });
};
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import FacebookProvider from 'next-auth/providers/facebook';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

const TURNSTILE_SECRET = '0x4AAAAAAB73ye6AEry1nmscbI8FjBdMD5Y';

async function verifyTurnstileToken(token, remoteIp) {
  if (!token) {
    return { success: false, message: 'Thiếu xác thực Cloudflare Turnstile.' };
  }
  try {
    const params = new URLSearchParams();
    params.append('secret', TURNSTILE_SECRET);
    params.append('response', token);
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: params,
    });
    const data = await response.json();
    if (!data.success) {
      return { success: false, message: 'Cloudflare Turnstile không hợp lệ.' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Không thể xác thực Turnstile.' };
  }
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const remoteIp = req?.headers?.['x-forwarded-for']?.split(',')[0];
        const verification = await verifyTurnstileToken(credentials?.turnstileToken, remoteIp);
        if (!verification.success) {
          throw new Error(verification.message);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_PHP_BASE_URL}/login.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
            remember: credentials?.remember === 'true',
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Thông tin đăng nhập không hợp lệ.');
        }
        return {
          id: data?.user?.id,
          name: data?.user?.name || data?.user?.username,
          email: data?.user?.email || credentials?.email,
          remember: credentials?.remember === 'true',
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.remember = user.remember;
        token.sessionExpiresIn = user.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.remember = token.remember;
      session.maxAge = token.sessionExpiresIn;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

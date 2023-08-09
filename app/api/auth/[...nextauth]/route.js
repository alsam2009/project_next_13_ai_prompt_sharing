import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import User from '@models/user';
import { connectToDB } from '@utils/database';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@due.ru"
        }
        // password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {

        if (!credentials.email) return null;
        const { email } = credentials
        try {
          await connectToDB();
          const user = await User.findOne({ email });
          if (!user) {
            const newUser = new User ({
              email
            })
            await User.create({
              email
            });
            return newUser
          } else {
            return user
          }
        } catch (error) {
          console.log("Error checking: ", error.message);
          return false
        }
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      // store the user id from MongoDB to session
      const sessionUser = await User.findOne({ email: session.user.email });
      session.user.id = sessionUser._id.toString();
      // console.log(session)
      return session;
    },
  },
});

export { handler as GET, handler as POST };

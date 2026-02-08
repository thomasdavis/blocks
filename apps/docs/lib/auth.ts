import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins/magic-link";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Resend } from "resend";

let _auth: ReturnType<typeof betterAuth> | null = null;

export function getAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: {
        dialect: new LibsqlDialect({
          url: process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN!,
        }),
        type: "sqlite",
      },
      plugins: [
        magicLink({
          sendMagicLink: async ({ email, url }) => {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: "Blocks <noreply@blocksai.dev>",
              to: email,
              subject: "Sign in to Blocks",
              html: `<p>Click <a href="${url}">here</a> to sign in to Blocks.</p>`,
            });
          },
        }),
      ],
    });
  }
  return _auth;
}

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




## Create your .env.local and paste the secrets below
NEXT_PUBLIC_SUPABASE_URL=https://hwxynvxkdufemrqcpbbs.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_V6CwN_RkmrWwt6iNBA1E5g_F9jhyrya

# Recommended for most uses
DATABASE_URL=postgresql://neondb_owner:npg_vsdf24TXoLqR@ep-lively-field-apafrhtf-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# For uses requiring a connection without pgbouncer
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_vsdf24TXoLqR@ep-lively-field-apafrhtf.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require

# Parameters for constructing your own connection string
PGHOST=ep-lively-field-apafrhtf-pooler.c-7.us-east-1.aws.neon.tech
PGHOST_UNPOOLED=ep-lively-field-apafrhtf.c-7.us-east-1.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_vsdf24TXoLqR

# Parameters for Vercel Postgres Templates
POSTGRES_URL=postgresql://neondb_owner:npg_vsdf24TXoLqR@ep-lively-field-apafrhtf-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_vsdf24TXoLqR@ep-lively-field-apafrhtf.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-lively-field-apafrhtf-pooler.c-7.us-east-1.aws.neon.tech
POSTGRES_PASSWORD=npg_vsdf24TXoLqR
POSTGRES_DATABASE=neondb
POSTGRES_URL_NO_SSL=postgresql://neondb_owner:npg_vsdf24TXoLqR@ep-lively-field-apafrhtf-pooler.c-7.us-east-1.aws.neon.tech/neondb
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_vsdf24TXoLqR@ep-lively-field-apafrhtf-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require

# DIRECT_URL="postgresql://postgres:Timsdeeclyde98@db.yfwlcjuyeavkcxtgrqdg.supabase.co:5432/postgres"

# # Connect to Postgres via the shared transaction-mode pooler (IPv4-only)
# DATABASE_URL="postgresql://postgres.hwxynvxkdufemrqcpbbs:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# # Connect to Postgres via the shared session-mode pooler (used for migrations)
# DIRECT_URL="postgresql://postgres.hwxynvxkdufemrqcpbbs:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
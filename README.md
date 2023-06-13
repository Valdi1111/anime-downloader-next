This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Install dependencies

```bash
npm install
```

Setup prisma db connection in prisma/schema.prisma file.
See documentation [here](https://pris.ly/d/connection-strings).

Generate prisma client from database.

```bash
npx prisma db pull
npx prisma generate
```

### Run the development server:

```bash
npm run dev
```

### Deploy:

```bash
npm run build
npm run start
```

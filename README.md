# Single Page Verification (SPV)

a single page verification application to verify a user, and send product page to the user.

## features

- html, js, css
- express
- zod
- fingerprint
- jwt
- crypto
- sqlite

## how it works

1. user registers on the index page, sends email and fingerprint to the server
2. server generates a hash code (has been verified) and sends it to the user
3. user clicks the verify url
4. index page shows a verified page

## how to use

1. install dependencies

```bash
pnpm i && pnpm approve-builds
```

2. edit your .env file

```bash
cp .env.example .env
```

3. init database

```bash
node init-db.js
```

4. run development server

```bash
pnpm d
```

5. run production server

```bash
pnpm p
```

6. remote deploy

```bash
chmod +x start stop
```

start server:

```bash
./start
```

stop server:

```bash
./stop
```

# Readwise Explorer

This app fetches all your highlights from your Readwise account and uses AI to help you discover related insights in your highlights.

## Local Development Guide

You need to have a Cloudflare Account on the Workers Standard plan.

> The reason why you need an account on the Workers Standard plan is that you might run into a "Too many subrequests error" if you run it on the Bundled plan. Cloudflare Workers on the Bundled plan are limited to a maximum of 50 subrequests.

1. Create a D1 database to store your highlights

   ```bash
   npx wrangler d1 create explorer-database
   ```

   A database ID will be printed to your console. Replace the `database_id` with that database ID.

2. Create a `highlights` table in your database.

   ```bash
   npx wrangler d1 execute explorer-database --command "CREATE TABLE IF NOT EXISTS highlights (id INTEGER PRIMARY KEY, text TEXT NOT NULL)"
   ```

3. Create a vectorize index to store vector embeddings

   ```bash
   npx wrangler vectorize create explorer-index --dimensions=768 --metric=cosine
   ```

4. Install dependencies in the React Project

   ```bash
   npm install
   ```

   Run this in the root directory of the project

5. Enter the `worker` directory and install dependencies for developing Cloudflare workers

   ```bash
   cd worker
   npm install
   ```

6. Start a remote workers development server on port `3333`

   ```bash
   npx wrangler dev --port 3333 --remote
   ```

   The `--remote` flag is important, as AI features that are essential for this app to work are not available when the development server is running locally.

   Make sure to run this from inside the `worker` directory.

   It is important to explicitly select a port where the Cloudflare worker will be served, as we make use of `http-proxy-middleware` in the React project to forward requests to `/api` to the Cloudflare worker. If you select a port other than `3333`, make sure to update it in `src/setupProxy.js`.

7. Start a React Development server

   ```bash
   npm start
   ```

8. Visit `http://localhost:3000` to view the running application.

## Deployment Guide (On Cloudflare Workers)

1. Build the React application

   ```bash
   npm run build
   ```

2. Copy the built assets into `/worker/build`

   ```bash
   cp -r build worker/
   ```

3. Enter the `worker` directory and deploy the worker

   ```bash
   cd worker
   npx wrangler deploy
   ```

   This deploys the worker and assets to Cloudflare.

### On Keeping Highlights Private

Keep in mind that after your publish your worker, all your highlights will be public. If you want to restrict access to your Cloudflare Worker, you have to deploy your worker to a custom domain and use [Cloudflare Access](https://www.cloudflare.com/zero-trust/products/access/) to restrict access to the application.

## Reseting your D1 Database and Vectorize Index

Run the following commands to empty your database and reset your vectorize index.

1. Delete all entries from the highlights table.

   ```bash
   npx wrangler d1 execute explorer-database --command "DELETE from highlights"
   ```

2. Delete the `explorer-index` Vectorize index

   ```bash
   npx wrangler vectorize delete explorer-index
   ```

3. Recreate the Vectorize index
   ```bash
   npx wrangler vectorize create explorer-index --dimensions=768 --metric=cosine
   ```

You will now have an empty highlights table and an empty Vectorize index, and everything should be back to default.

4. (Optional) If you already deployed your worker, you will have to redeploy it.
   ```bash
   cd worker
   npx wrangler deploy
   ```


## Possible Future Improvements

- Building a multi-tenant version of this that can store multiple users' highlights.
- Continously syncing highlights from Readwise, rather than only syncing the first time one uses it.
- Writing a GitHub CI workflow that automatically deploys the Worker to Cloudflare on push to GitHub.

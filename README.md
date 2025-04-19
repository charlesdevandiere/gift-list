# gift-list
Share your gift list with family.

## Deploy

1. Build image
   ```shell
   docker compose build
   ```
1. Hash your admin password
   ```shell
   cd api/ && \
   npm run hash-password -- <your-password>
   ```
1. Create `/var/lib/gift-list` folder
   ```shell
   sudo mkdir /var/lib/gift-list
   ```
1. Create `.env` file into `/var/lib/gift-list`
   ```ini
   NODE_ENV=prod
   PORT=3000
   LOG_LEVEL=http
   LOG_FOLDER=/var/log/gift-list
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gift-list?schema=gift-list
   ADMIN_PASSWORD_HASH=<your-admin-password-hash>
   MAX_NUMBER_OF_GROUPS=10
   MAX_NUMBER_OF_USERS_PER_GROUP=100
   MAX_NUMBER_OF_GIFTS_PER_USER=100
   ```
1. Create `/var/log/gift-list` folder
   ```shell
   sudo mkdir /var/log/gift-list && \
   sudo chmod 1969:1961 /var/log/gift-list
   ```

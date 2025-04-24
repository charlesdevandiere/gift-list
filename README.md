# gift-list
Share your gift list with family.

## Deploy

1. Configure postgresql

   `/etc/postgresql/16/main/postgresql.conf`
   ```
   listen_addresses = 'localhost,<docker0_ip_address>'
   ```
   `/etc/postgresql/16/main/pg_hba.conf`
   ```
   host    all             all             172.0.0.0/8           scram-sha-256
   ```
   ```shell
   sudo systemctl restart postgresql
   ```
1. Create database and user
   ```shell
   sudo -u postgres createuser gift-list_user
   ```
   ```shell
   sudo -u postgres createdb gift-list
   ```
   ```shell
   sudo -u postgres psql
   psql=# alter user "gift-list_user" with encrypted password '<password>';
   psql=# grant all privileges on database "gift-list" to "gift-list_user" ;
   ```
1. Build image
   ```shell
   docker compose build
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
   DATABASE_URL=postgresql://gift-list_user:<password>@host.docker.internal:5432/gift-list?schema=gift-list
   ADMIN_PASSWORD_HASH=<your-admin-password-hash>
   MAX_NUMBER_OF_GROUPS=10
   MAX_NUMBER_OF_USERS_PER_GROUP=100
   MAX_NUMBER_OF_GIFTS_PER_USER=100
   ```
   ```shell
   sudo chown 1969:docker /var/lib/gift-list/.env && \
   sudo chmod 660 /var/lib/gift-list/.env
   ```
1. Copy `compose.yaml` into `/var/lib/gift-list`
   ```shell
   sudo cp compose.yaml /var/lib/gift-list
   ``` 
1. Create `/var/log/gift-list` folder
   ```shell
   sudo mkdir /var/log/gift-list && \
   sudo chown 1969:1961 /var/log/gift-list
   ```
1. Update nginx conf
   ```nginx
   access_log /var/log/nginx/gift-list.access.log;
   error_log /var/log/nginx/gift-list.error.log;

   location / {
       proxy_pass              http://localhost:3000/;
       proxy_set_header        Host $host;
   }
   ```
   ```shell
   sudo systemctl restart nginx.service
   ```

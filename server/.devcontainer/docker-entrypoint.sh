#!/bin/sh
set -e

# Initialize the database if it doesn't exist
if [ ! -s /var/lib/postgresql/data/PG_VERSION ]; then
    su-exec postgres initdb -D /var/lib/postgresql/data
    echo "host all all 0.0.0.0/0 md5" >>/var/lib/postgresql/data/pg_hba.conf
    echo "listen_addresses='*'" >>/var/lib/postgresql/data/postgresql.conf

    # Start PostgreSQL temporarily to set up the initial user and database
    su-exec postgres pg_ctl -D /var/lib/postgresql/data -w start

    psql --username postgres <<-EOSQL
        CREATE USER $POSTGRES_USER WITH SUPERUSER PASSWORD '$POSTGRES_PASSWORD';
        CREATE DATABASE $POSTGRES_DB;
        GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL

    su-exec postgres pg_ctl -D /var/lib/postgresql/data -m fast -w stop
fi

# Ensure the correct permissions are set
chown -R postgres:postgres /var/lib/postgresql/data

# Start PostgreSQL in the foreground
exec su-exec postgres postgres -D /var/lib/postgresql/data

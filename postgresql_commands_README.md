# Common PostgreSQL Commands

This README provides a quick reference for frequently used PostgreSQL commands.

## Getting Started

### Connect to PostgreSQL
```bash
psql -U username -d database_name -h host -p port
```
Example:
```bash
psql -U postgres -d mydatabase
```
If no database is specified, it will connect to a database with the same name as the user.

### Connect to PostgreSQL with a specific user
```bash
psql -U your_username -d your_database
```

### Exit psql
```sql
\q
```

## Database Management

### List all databases
```sql
\l
```

### Create a new database
```sql
CREATE DATABASE database_name;
```

### Drop a database
```sql
DROP DATABASE database_name;
```

### Connect to another database (while in psql)
```sql
\c database_name
```

## Table Management

### List all tables in the current database
```sql
\dt
```

### Describe a table (show columns, types, etc.)
```sql
\d table_name
```

### Create a new table
```sql
CREATE TABLE table_name (
    column1_name data_type PRIMARY KEY,
    column2_name data_type UNIQUE,
    column3_name data_type NOT NULL,
    column4_name data_type DEFAULT default_value
);
```
Example:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Drop a table
```sql
DROP TABLE table_name;
```

### Alter a table (add a column)
```sql
ALTER TABLE table_name ADD COLUMN new_column_name data_type;
```

### Alter a table (drop a column)
```sql
ALTER TABLE table_name DROP COLUMN column_name;
```

## Data Manipulation (CRUD)

### Insert data into a table
```sql
INSERT INTO table_name (column1, column2, column3) VALUES (value1, value2, value3);
```
Example:
```sql
INSERT INTO users (username, email) VALUES ('john_doe', 'john@example.com');
```

### Select all data from a table
```sql
SELECT * FROM table_name;
```

### Select specific columns from a table
```sql
SELECT column1, column2 FROM table_name;
```

### Select data with conditions
```sql
SELECT * FROM table_name WHERE column_name = 'some_value';
```

### Update data in a table
```sql
UPDATE table_name SET column1 = new_value WHERE condition;
```
Example:
```sql
UPDATE users SET email = 'john.doe@example.com' WHERE username = 'john_doe';
```

### Delete data from a table
```sql
DELETE FROM table_name WHERE condition;
```
Example:
```sql
DELETE FROM users WHERE username = 'john_doe';
```

## User and Role Management

### List all users/roles
```sql
\du
```

### Create a new user/role
```sql
CREATE USER username WITH PASSWORD 'your_password';
```

### Grant privileges to a user
```sql
GRANT ALL PRIVILEGES ON DATABASE database_name TO username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO username;
```

### Revoke privileges from a user
```sql
REVOKE ALL PRIVILEGES ON DATABASE database_name FROM username;
```

## Backup and Restore

### Backup a database
```bash
pg_dump -U username -d database_name -F p -f backup.sql
```

### Restore a database
```bash
psql -U username -d database_name -f backup.sql
```

## Useful psql commands (meta-commands)

*   `\?`: help on psql commands
*   `\h`: help on SQL commands
*   `\l`: list databases
*   `\dt`: list tables in current database
*   `\d table_name`: describe table
*   `\dn`: list schemas
*   `\df`: list functions
*   `\dv`: list views
*   `\du`: list users
*   `\ef`: edit function definition
*   `\i filename`: execute commands from file
*   `\o filename`: send all query results to file
*   `\e`: edit query buffer (then run with `\g`)
*   `\s filename`: save command history to file
*   `\x`: toggle expanded output
*   `\timing`: toggle display of statement execution times
*   `\q`: quit psql

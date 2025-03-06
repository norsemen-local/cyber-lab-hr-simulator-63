
#!/bin/sh
# Wait for MySQL to be ready
echo "Waiting for MySQL database..."
sleep 5  # Simple wait to allow database to initialize

# Seed the database with employee records
echo "Seeding the database with employee records..."
node db/seedEmployees.js

# Start the app
echo "Starting HR Portal server..."
node index.js

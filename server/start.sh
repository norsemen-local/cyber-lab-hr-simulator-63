
#!/bin/sh
# Wait for MySQL to be ready
echo "Waiting for MySQL database..."
sleep 5  # Simple wait to allow database to initialize

# Start the app
echo "Starting HR Portal server..."
node index.js

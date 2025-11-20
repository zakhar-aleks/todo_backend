# Todo Backend

## Configuration

Create a `.env` file in the root directory with the following required variables:

```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_db_name
DATABASE_URL=postgresql://user:password@localhost:5432/db_name

JWT_SECRET=your_jwt_secret
PORT=3000

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
```

## Installation & Running

Once your `.env` file is configured, run the following command to install dependencies and start the containers in detached mode:

```bash
npm i && docker compose up --build -d
```

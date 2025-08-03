@echo off
echo 🚀 Setting up Circlo Rental Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

REM Create environment files if they don't exist
echo ⚙️  Setting up environment files...

if not exist ".env" (
    echo 📝 Creating frontend .env file...
    copy env.example .env
    echo ✅ Frontend .env created. Please update with your configuration.
) else (
    echo ✅ Frontend .env already exists.
)

if not exist "backend\.env" (
    echo 📝 Creating backend .env file...
    copy backend\env.example backend\.env
    echo ✅ Backend .env created. Please update with your configuration.
) else (
    echo ✅ Backend .env already exists.
)

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist "backend\uploads" mkdir backend\uploads

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Update backend\.env with your database and Razorpay credentials
echo 2. Update .env with your API URL and Razorpay key
echo 3. Start the backend: cd backend ^&^& npm run dev
echo 4. Start the frontend: npm run dev
echo.
echo 📚 For detailed instructions, see README.md
pause 
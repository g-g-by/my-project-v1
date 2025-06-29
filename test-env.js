require('dotenv').config();

console.log('Testing .env file reading:');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', __dirname);
console.log('.env file should be at:', __dirname + '\\.env');

console.log('Environment variables:');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV); 
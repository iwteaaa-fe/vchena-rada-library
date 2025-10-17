const mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(error => {
    if (error) {
        console.error('ПОМИЛКА ПІДКЛЮЧЕННЯ ДО БАЗИ ДАНИХ:', error);
        return;
    }
    console.log('Успішно підключено до бази даних MySQL!');
});

module.exports = connection;
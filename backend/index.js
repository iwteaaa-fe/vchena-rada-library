const express = require('express');

const app = express();

app.use(express.json());

const PORT = 5000;

app.get('/', (req, res) => {
    res.json({ message: 'Вітаю! Сервер бібліотеки Вченої ради працює!' });
});

const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Сервер успішно запущено на порті ${PORT}`);
});
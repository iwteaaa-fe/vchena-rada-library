const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

exports.register = (req, res) => {
    try {
        const { email, password, full_name } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ message: 'Будь ласка, заповніть усі поля' });
        }

        db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                return res.status(500).json({ message: 'Помилка сервера', error });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Користувач з таким email вже існує' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                'INSERT INTO users SET ?',
                { email, password: hashedPassword, full_name, role_id: 3 },
                (error, result) => {
                    if (error) {
                        return res.status(500).json({ message: 'Помилка при реєстрації', error });
                    }

                    return res.status(201).json({ message: 'Користувач успішно зареєстрований' });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: 'Внутрішня помилка сервера', error });
    }
};

exports.login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Будь ласка, введіть email та пароль' });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                return res.status(500).json({ message: 'Помилка сервера', error });
            }

            if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).json({ message: 'Неправильний email або пароль' });
            }

            const user = results[0];
            const token = jwt.sign(
                { id: user.id, role_id: user.role_id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                message: 'Вхід успішний!',
                token
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Внутрішня помилка сервера', error });
    }
}

exports.getMe = (req, res) => {
    res.status(200).json({
        id: req.user.id,
        role_id: req.user.role_id,
        message: 'Дані успішно отримано'
    });
};
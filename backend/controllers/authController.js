const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
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
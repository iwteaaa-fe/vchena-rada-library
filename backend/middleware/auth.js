const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded;

            next();
        } catch (error) {
            res.status(401).json({ message: 'Немає авторизації, токен недійсний' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Немає авторизації, токен відсутній' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role_id === 1) {
        next();
    } else {
        res.status(403).json({ message: 'Доступ заборонено. Потрібні права адміністратора.' });
    }
};

module.exports = { protect, isAdmin };
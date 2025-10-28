const multer = require('multer');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

exports.uploadDocument = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не було завантажено' });
        }

        const { title, description, document_number, document_date, type_id } = req.body;
        const uploader_id = req.user.id;
        if (!title || !type_id) {
            return res.status(400).json({ message: 'Заголовок та тип документа є обов\'язковими' });
        }

        const newDocument = {
            title,
            description,
            document_number,
            document_date: document_date || null,
            file_path: req.file.path,
            file_type: req.file.mimetype,
            file_size: req.file.size,
            type_id,
            uploader_id
        };

        db.query('INSERT INTO documents SET ?', newDocument, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Помилка при збереженні документа в БД' });
            }
            res.status(201).json({ message: 'Документ успішно завантажено!', documentId: results.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Внутрішня помилка сервера' });
    }
};

exports.getAllDocuments = (req, res) => {
    const sql = `
    SELECT 
      d.id, d.title, d.description, d.document_number, d.document_date, d.upload_date,
      dt.name AS document_type,
      u.full_name AS uploader_name
    FROM documents d
    JOIN document_types dt ON d.type_id = dt.id
    JOIN users u ON d.uploader_id = u.id
    ORDER BY d.upload_date DESC;
  `;

    db.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Помилка при отриманні документів' });
        }
        res.status(200).json(results);
    });
};

exports.deleteDocument = (req, res) => {
    const documentId = req.params.id;

    db.query('SELECT file_path FROM documents WHERE id = ?', [documentId], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Помилка сервера при пошуку документа' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Документ не знайдено' });
        }

        const filePath = results[0].file_path;

        db.query('DELETE FROM documents WHERE id = ?', [documentId], (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Помилка при видаленні документа з БД' });
            }

            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Не вдалося видалити файл:', err);
                }
                res.status(200).json({ message: 'Документ успішно видалено' });
            });
        });
    });
};

exports.updateDocument = (req, res) => {
    const documentId = req.params.id;
    const { title, description, document_number, document_date, type_id } = req.body;

    const updatedFields = {};

    if (title !== undefined) updatedFields.title = title;
    if (description !== undefined) updatedFields.description = description;
    if (document_number !== undefined) updatedFields.document_number = document_number;
    if (document_date !== undefined) updatedFields.document_date = document_date;
    if (type_id !== undefined) updatedFields.type_id = type_id;

    if (Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ message: 'Немає даних для оновлення' });
    }

    db.query('UPDATE documents SET ? WHERE id = ?', [updatedFields, documentId], (error, result) => {
        if (error) {
            console.error('SQL Error on UPDATE:', error);
            return res.status(500).json({ message: 'Помилка при оновленні документа' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Документ не знайдено' });
        }
        res.status(200).json({ message: 'Дані документа успішно оновлено' });
    });
};

exports.uploadMiddleware = upload;
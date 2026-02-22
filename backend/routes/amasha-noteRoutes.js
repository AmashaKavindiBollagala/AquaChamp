import express from 'express';
import { getAllNotes, createNewNote, updateNote, deleteNote } from '../controllers/amasha-notesController.js';
import verifyJWT from '../middleware/amasha-verifyJWT.js';

const router = express.Router();

router.use(verifyJWT); // All note routes require a valid JWT

router.route('/')
    .get(getAllNotes)
    .post(createNewNote)
    .patch(updateNote)
    .delete(deleteNote);

export default router;
const express = require('express');
const controller = require('../controllers/notes.controller');
const { validateNoteId } = require('../middleware/validate');

const router = express.Router();

router
  .route('/')
  .get(controller.listNotes)
  .post(controller.createNote);

router
  .route('/:id')
  .all(validateNoteId)
  .get(controller.getNote)
  .put(controller.updateNote)
  .delete(controller.deleteNote);

module.exports = router;

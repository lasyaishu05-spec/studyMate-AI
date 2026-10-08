const service = require('../services/noteService');
const aiService = require('../services/aiService');

async function create(req, res, next) {
  try {
    const note = await service.create(req.params.notebookId, req.user.id, req.body);
    res.status(201).json(note);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    res.json(await service.listForNotebook(req.params.notebookId, req.user.id));
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    res.json(await service.getNote(req.params.id, req.params.notebookId, req.user.id));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    res.json(await service.update(req.params.id, req.params.notebookId, req.user.id, req.body));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id, req.params.notebookId, req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

async function summarize(req, res, next) {
  try {
    const note = await service.getNote(req.params.id, req.params.notebookId, req.user.id);
    const summary = await aiService.summarizeNote(note.content);
    res.json({ summary });
  } catch (err) { next(err); }
}

async function quiz(req, res, next) {
  try {
    const note = await service.getNote(req.params.id, req.params.notebookId, req.user.id);
    const questions = await aiService.generateQuiz(note.content);
    res.json({ questions });
  } catch (err) { next(err); }
}



module.exports = { create, list, get, update, remove, summarize, quiz };

const service = require('../services/notebookService');

async function create(req, res, next) {
 try {
   const notebook = await service.create(req.user.id, req.body.title);
   res.status(201).json(notebook);
 } catch (err) { next(err); }
}

async function list(req, res, next) {
 try {
   res.json(await service.listForUser(req.user.id));
 } catch (err) { next(err); }
}

async function update(req, res, next) {
 try {
   res.json(await service.update(req.params.id, req.user.id, req.body.title));
 } catch (err) { next(err); }
}

async function remove(req, res, next) {
 try {
   await service.remove(req.params.id, req.user.id);
   res.status(204).send();
 } catch (err) { next(err); }
}

module.exports = { create, list, update, remove };
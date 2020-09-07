import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import upload from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepo = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepo.find({
    select: ['id', 'title', 'value', 'category', 'created_at', 'updated_at'],
    relations: ['category'],
  });
  const balance = await transactionRepo.getBalance();
  const responseFormated = {
    transactions,
    balance,
  };
  return response.json(responseFormated);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    category,
    title,
    type,
    value,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteService = new DeleteTransactionService();
  await deleteService.execute({ id });
  return response.json();
});

const multerConfig = multer(upload);

transactionsRouter.post(
  '/import',
  multerConfig.single('file'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService();
    const transactions = await importTransactionService.execute({
      fileName: request.file.originalname,
    });
    return response.json(transactions);
  },
);

export default transactionsRouter;

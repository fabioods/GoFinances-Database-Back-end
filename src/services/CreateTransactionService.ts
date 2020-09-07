import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepo = getRepository(Category);
    const transactionRepo = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepo.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError("You don't have enough money for this operation");
    }

    const categoryByName = await categoryRepo.findOne({
      where: { title: category },
    });
    const categoryModel =
      categoryByName || categoryRepo.create({ title: category });

    if (!categoryByName) {
      await categoryRepo.save(categoryModel);
    }

    const transaction = transactionRepo.create({
      title,
      value,
      type,
      category_id: categoryModel.id,
    });

    await transactionRepo.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

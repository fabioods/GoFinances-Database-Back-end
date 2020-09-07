import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepo = getCustomRepository(TransactionsRepository);
    const transaction = ((await transactionRepo.findByIds([
      id,
    ])) as Transaction[])[0];

    if (!transaction) {
      throw new AppError('Transaction id does not exists');
    }

    await transactionRepo.delete({ id: transaction.id });
  }
}

export default DeleteTransactionService;

/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';
import Transaction from '../models/Transaction';
import upload from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  fileName: string;
}

interface CSVFile {
  title: string;
  type: 'income' | 'outcome';
  valueString: string;
  category: string;
}

class ImportTransactionsService {
  async execute({ fileName }: Request): Promise<Transaction[]> {
    const filePath = path.join(upload.directory, fileName);
    const csvFilePath = path.resolve(filePath);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: Array<CSVFile> = [];
    parseCSV.on('data', line => {
      const [title, type, valueString, category] = line;
      lines.push({ title, type, valueString, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const createTransactionService = new CreateTransactionService();
    const transactions: Transaction[] = [];
    for (let index = 0; index < lines.length; index++) {
      const { title, type, valueString, category } = lines[index];
      const value = Number(valueString);
      const transaction = await createTransactionService.execute({
        title,
        type,
        value,
        category,
      });
      transactions.push(transaction);
    }

    await fs.promises.unlink(filePath);

    return transactions;
  }
}

export default ImportTransactionsService;

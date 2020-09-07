import multer from 'multer';
import path from 'path';

const directory = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory,
  storage: multer.diskStorage({
    destination: directory,
    filename(req, file, callback) {
      const fileName = file.originalname;
      return callback(null, fileName);
    },
  }),
};

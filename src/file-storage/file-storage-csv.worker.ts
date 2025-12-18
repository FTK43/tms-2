import { parentPort, workerData } from 'worker_threads';

function handleCsvImport(file: Express.Multer.File) {
  // to do -> HOMEWORK 17
  // 1. Read File
  // 2. Handle line-by-line
  // 3. Store in the Database
  setTimeout(() => console.log(file.originalname), 10_000);

  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
}

const result = handleCsvImport(workerData);
parentPort.postMessage(result);

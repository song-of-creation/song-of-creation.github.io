import fs from 'fs';
import path from 'path';
import { readBoard } from '../read-board';

export async function writeBoard(board) {
  try {
    fs.writeFileSync(
      path.join(process.cwd(), 'board.json'),
      JSON.stringify(board)
    );
    const boardToReturn = await readBoard();
    return Promise.resolve(boardToReturn);
  } catch (error) {
    return Promise.reject({
      message: `Failed to write board.json`,
      status: 500
    });
  }
}

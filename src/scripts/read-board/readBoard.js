import fs from 'fs';
import path from 'path';

export async function readBoard() {
  try {
    const board = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'board.json'), 'utf8')
    );
    return Promise.resolve(board);
  } catch (error) {
    return Promise.reject({
      message: `Failed to read board.json`,
      status: 500
    });
  }
}

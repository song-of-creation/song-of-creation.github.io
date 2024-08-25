import { NextResponse } from 'next/server';

import { readBoard, writeBoard } from '@/scripts';

type Error = {
  message: string;
  status: number;
};

export async function GET() {
  try {
    const board = await readBoard();
    return NextResponse.json(board, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message ?? 'Failed to fetch board' },
      { status: (error as Error)?.status ?? 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const boardToWrite = await request.json();
    const board = await writeBoard(boardToWrite);
    return NextResponse.json(board, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message ?? 'Failed to fetch board' },
      { status: (error as Error)?.status ?? 500 }
    );
  }
}

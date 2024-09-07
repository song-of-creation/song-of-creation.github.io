import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextResponse } from 'next/server';

type Error = {
  message: string;
  status: number;
};

export async function GET() {
  try {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = new MongoClient(process.env.DB_CONNECTION_STRING!, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db(process.env.DB_DATABASE_NAME);
    const collection = database.collection(process.env.DB_COLLECTION_NAME!);

    try {
      const board = await collection.find({}).toArray();
      await client.close();
      return NextResponse.json(board?.[0] ?? {}, { status: 200 });
    } catch (error) {
      await client.close();
      return NextResponse.json(
        { error: (error as Error)?.message ?? 'Failed to fetch board' },
        { status: (error as Error)?.status ?? 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message ?? 'Failed to connect to mongodb' },
      { status: (error as Error)?.status ?? 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = new MongoClient(process.env.DB_CONNECTION_STRING!, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db(process.env.DB_DATABASE_NAME);
    const collection = database.collection(process.env.DB_COLLECTION_NAME!);

    try {
      const boardToWrite = await request.json();

      const board = await collection.findOneAndUpdate(
        {},
        { $set: { columns: boardToWrite.columns } },
        { returnDocument: 'after' }
      );
      await client.close();
      return NextResponse.json(board, { status: 200 });
    } catch (error) {
      await client.close();
      return NextResponse.json(
        { error: (error as Error)?.message ?? 'Failed to fetch board' },
        { status: (error as Error)?.status ?? 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message ?? 'Failed to connect to mongodb' },
      { status: (error as Error)?.status ?? 500 }
    );
  }
}

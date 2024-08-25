import type { Card, KanbanBoard } from '@caldwell619/react-kanban';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

export function usePostBoard(
  setBoard: Dispatch<
    SetStateAction<KanbanBoard<
      Card & {
        link: string;
        startDate?: string;
        endDate?: string;
      }
    > | null>
  >
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  return { trigger, isLoading, error };

  function trigger(
    board: KanbanBoard<
      Card & { link: string; startDate?: string; endDate?: string }
    >
  ) {
    setIsLoading(true);
    fetch('/api/board', { method: 'POST', body: JSON.stringify(board) }).then(
      (res) =>
        res.json().then((board) => {
          setBoard(board);
          setIsLoading(false);
        }),
      (reason) => setError(reason)
    );
    // setBoard(board);
  }
}

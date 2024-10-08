import type { Card, KanbanBoard } from '@caldwell619/react-kanban';
import moment from 'moment';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

export function useBoardApiRequests(
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

  return { getBoard, putBoard, isLoading, error };

  function getBoard() {
    setIsLoading(true);
    return fetch('/api/board')
      .then(
        (res) => res.json(),
        (reason) => {
          setError(reason);
          return Promise.reject(reason);
        }
      )
      .then((board) => {
        setBoard(board);
        setIsLoading(false);
        return Promise.resolve(board);
      })
      .catch((e) => {
        setError(e);
        return Promise.reject(error);
      });
  }

  function putBoard(
    board: KanbanBoard<
      Card & { link: string; startDate?: string; endDate?: string }
    >
  ) {
    setIsLoading(true);
    fetch('/api/board', {
      method: 'POST',
      body: JSON.stringify(sortCards(board))
    }).then(
      (res) =>
        res.json().then((board) => {
          setBoard(board);
          setIsLoading(false);
        }),
      (reason) => setError(reason)
    );
  }

  function sortCards(
    board: KanbanBoard<
      Card & { link: string; startDate?: string; endDate?: string }
    >
  ) {
    const boardCopy = JSON.parse(JSON.stringify(board));
    return {
      ...boardCopy,
      columns: boardCopy?.columns?.map(
        (
          column: KanbanBoard<
            Card & { link: string; startDate?: string; endDate?: string }
          >['columns']['0']
        ) => {
          return {
            ...column,
            cards: column?.cards?.sort?.((c1, c2) => {
              let startDate1 = moment(c1?.startDate);
              let startDate2 = moment(c2?.startDate);
              let endDate1 = moment(c1?.endDate);
              let endDate2 = moment(c2?.endDate);
              startDate1 = startDate1.isValid()
                ? startDate1
                : moment(new Date(0));
              startDate2 = startDate2.isValid()
                ? startDate2
                : moment(new Date(0));
              endDate1 = endDate1.isValid() ? endDate1 : moment(new Date(0));
              endDate2 = endDate2.isValid() ? endDate2 : moment(new Date(0));
              const endDateDiff = endDate2.diff(endDate1);
              if (endDateDiff !== 0) {
                return endDateDiff;
              }
              return startDate2.diff(startDate1);
            })
          };
        }
      )
    };
  }
}

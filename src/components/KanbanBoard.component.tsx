import { usePostBoard } from '@/hooks';
import type { Card, KanbanBoard } from '@caldwell619/react-kanban';
import {
  addCard,
  ControlledBoard,
  moveCard,
  moveColumn,
  removeCard,
  removeColumn
} from '@caldwell619/react-kanban';
import '@caldwell619/react-kanban/dist/styles.css';
import { set } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { v4 as uuid } from 'uuid';

export function KanbanBoard() {
  const [board, setBoard] = useState<KanbanBoard<
    Card & { link: string; startDate?: string; endDate?: string }
  > | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const { error, isLoading, trigger } = usePostBoard(setBoard);

  useEffect(() => {
    fetch('/api/board')
      .then((res) => res.json())
      .then((board) => {
        setBoard(board);
      });
    // setBoard(boardJSON);
  }, []);

  if (!board || error || isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col xl:flex-row items-start w-full justify-between">
      <ControlledBoard
        renderCard={(card) => {
          const column = findColumnByCardId(`${card.id}`)!;
          return (
            <div className="bg-[#fff] p-[10px] w-[350px] mb-[10px]">
              <span>
                <div className="border-b-solid border-b-[1px] border-b-[#eee] pb-[5px] font-bold flex justify-between">
                  <span className="truncate max-w-[calc(100%-15px)] whitespace-pre-wrap">
                    {card.title}
                  </span>
                  {column.id === '1' && (
                    <button
                      onClick={() => {
                        // setBoard((currentBoard) =>
                        //   removeCard(currentBoard, column, card)
                        // );
                        const currentBoard = JSON.parse(JSON.stringify(board));
                        trigger(removeCard(currentBoard, column, card));
                      }}
                      className="cursor-pointer"
                    >
                      X
                    </button>
                  )}
                </div>
              </span>
              <div className="pt-[10px]">
                <div className="flex flex-col w-full gap-[10px]">
                  <div className="flex flex-col">
                    Link:
                    <a
                      href={card.link}
                      className="underline text-blue-500 truncate"
                    >
                      {card.link}
                    </a>
                  </div>
                  {column.id !== '1' && (
                    <div className="flex flex-col">
                      Start Date:
                      <span>{card.startDate}</span>
                    </div>
                  )}
                  {column.id === '3' && (
                    <div className="flex flex-col">
                      End Date:
                      <span>{card.endDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }}
        onCardDragEnd={(_card, source, destination) => {
          // setBoard((currentBoard) => {
          //   if (
          //     source?.fromColumnId === '1' &&
          //     destination?.toColumnId === '2'
          //   ) {
          //     const columnIdxToChange = currentBoard!.columns.findIndex(
          //       (col) => col.id === source.fromColumnId
          //     );
          //     set(
          //       currentBoard!,
          //       [
          //         'columns',
          //         columnIdxToChange,
          //         'cards',
          //         source.fromPosition,
          //         'startDate'
          //       ],
          //       moment().format('MMM DD YYYY, HH:mm')
          //     );
          //   } else if (
          //     source?.fromColumnId === '2' &&
          //     destination?.toColumnId === '3'
          //   ) {
          //     const columnIdxToChange = currentBoard!.columns.findIndex(
          //       (col) => col.id === source.fromColumnId
          //     );
          //     set(
          //       currentBoard!,
          //       [
          //         'columns',
          //         columnIdxToChange,
          //         'cards',
          //         source.fromPosition,
          //         'endDate'
          //       ],
          //       moment().format('MMM DD YYYY, HH:mm')
          //     );
          //   } else if (
          //     source?.fromColumnId === '1' &&
          //     destination?.toColumnId === '3'
          //   ) {
          //     return currentBoard;
          //   }
          //   return moveCard(currentBoard, source, destination);
          // });

          const currentBoard = JSON.parse(JSON.stringify(board));
          if (source?.fromColumnId === '1' && destination?.toColumnId === '2') {
            const columnIdxToChange = currentBoard!.columns.findIndex(
              (col: KanbanBoard<Card>['columns']['0']) =>
                col.id === source.fromColumnId
            );
            set(
              currentBoard!,
              [
                'columns',
                columnIdxToChange,
                'cards',
                source.fromPosition,
                'startDate'
              ],
              moment().format('MMM DD YYYY, HH:mm')
            );
          } else if (
            source?.fromColumnId === '2' &&
            destination?.toColumnId === '3'
          ) {
            const columnIdxToChange = currentBoard!.columns.findIndex(
              (col: KanbanBoard<Card>['columns']['0']) =>
                col.id === source.fromColumnId
            );
            set(
              currentBoard!,
              [
                'columns',
                columnIdxToChange,
                'cards',
                source.fromPosition,
                'endDate'
              ],
              moment().format('MMM DD YYYY, HH:mm')
            );
          } else if (
            source?.fromColumnId === '1' &&
            destination?.toColumnId === '3'
          ) {
            return;
          }
          trigger(moveCard(currentBoard, source, destination));
        }}
        onCardRemove={(info) => {
          // setBoard(removeCard(info.board, info.column, info.card));
          trigger(removeCard(info.board, info.column, info.card));
        }}
        onColumnDragEnd={(_column, source, destination) => {
          // setBoard((currentBoard) => {
          //   return moveColumn(currentBoard, source, destination);
          // });
          const currentBoard = JSON.parse(JSON.stringify(board));
          trigger(moveColumn(currentBoard, source, destination));
        }}
        onColumnRemove={(info) => {
          // setBoard(removeColumn(info.board, info.column));
          trigger(removeColumn(info.board, info.column));
        }}
        allowAddColumn={false}
        allowRemoveColumn={false}
        allowRenameColumn={false}
        allowAddCard={false}
        allowRemoveCard
      >
        {board}
      </ControlledBoard>
      <button
        onClick={() => setIsAddCardModalOpen(true)}
        className="mt-[10px] ml-[10px] xl:ml-0 border-solid border-[1px] border-[#000] p-[6px] bg-[#e0e0e0]"
      >
        Add Show
      </button>

      <Modal
        open={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        classNames={{ modal: 'w-[400px]' }}
        center
      >
        <h2 className="w-full mb-[15px]">Enter Show Information</h2>
        <form
          action={undefined}
          onSubmit={(e) => {
            e.preventDefault();
            // setBoard((currentBoard) => {
            //   return addCard(
            //     currentBoard!,
            //     {
            //       id: '1'
            //     },
            //     {
            //       id: uuid(),
            //       title: (e.target as any).title.value,
            //       link: (e.target as any).link.value
            //     }
            //   );
            // });
            const currentBoard = JSON.parse(JSON.stringify(board));
            trigger(
              addCard(
                currentBoard!,
                {
                  id: '1'
                },
                {
                  id: uuid(),
                  title: (e.target as any).title.value,
                  link: (e.target as any).link.value
                }
              )
            );
            setIsAddCardModalOpen(false);
          }}
          className="flex flex-col w-full items-start gap-[15px]"
        >
          <label className="w-full flex flex-col">
            Title:
            <input
              type="text"
              name="title"
              className="border-solid border-[1px] border-[#000] p-[2px]"
            />
          </label>
          <label className="w-full flex flex-col">
            Link:
            <input
              type="text"
              name="link"
              className="border-solid border-[1px] border-[#000] p-[2px]"
            />
          </label>
          <button
            type="submit"
            className="border-solid border-[1px] border-[#000] p-[6px] bg-[#e0e0e0]"
          >
            Add Show
          </button>
        </form>
      </Modal>
    </div>
  );

  function findColumnByCardId(cardId: string) {
    return board!.columns.find(
      (column) => column.cards.filter((card) => card.id === cardId).length > 0
    );
  }
}

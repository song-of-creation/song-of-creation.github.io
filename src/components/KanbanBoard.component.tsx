import { usePostBoard } from '@/hooks';
import type { Card, KanbanBoard } from '@caldwell619/react-kanban';
import {
  addCard,
  changeCard,
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
  const [editingCard, setEditingCard] = useState<
    (Card & { link: string; startDate?: string; endDate?: string }) | null
  >(null);
  const { error, isLoading, trigger } = usePostBoard(setBoard);

  useEffect(() => {
    fetch('/api/board')
      .then((res) => res.json())
      .then((board) => {
        setBoard(board);
      });
    // setBoard({
    //   columns: [
    //     {
    //       id: '1',
    //       title: 'Can Watch',
    //       cards: [
    //         {
    //           id: '2c0f0a6a-e206-4e79-be10-cea2e3dd5697',
    //           title: 'Yuru Camp Season 2',
    //           link: 'https://anilist.co/anime/104459/Yuru-Camp-SEASON-2/',
    //           startDate: 'Aug 25 2024, 17:19',
    //           endDate: 'Aug 25 2024, 17:20'
    //         }
    //       ]
    //     },
    //     {
    //       id: '2',
    //       title: 'Watching',
    //       cards: []
    //     },
    //     {
    //       id: '3',
    //       title: 'Watched',
    //       cards: []
    //     }
    //   ]
    // });
  }, []);

  useEffect(() => {
    window.addEventListener(
      'com.watchalong.addCard',
      handleAddCardEvent as EventListener
    );
    return () => {
      window.removeEventListener(
        'com.watchalong.addCard',
        handleAddCardEvent as EventListener
      );
    };
    function handleAddCardEvent(e: CustomEvent) {
      const currentBoard = JSON.parse(JSON.stringify(board));
      trigger(
        addCard(
          currentBoard!,
          {
            id: '1'
          },
          {
            id: uuid(),
            title: (e.detail as any).title,
            link: (e.detail as any).link
          }
        )
      );
    }
  }, [board]);

  if (!board || error || isLoading) {
    return null;
  }

  return (
    <>
      <ControlledBoard
        renderCard={(card) => {
          const column = findColumnByCardId(`${card.id}`)!;
          return (
            <div
              className="bg-[#fff] p-[10px] w-full max-w-[350px] mb-[10px]"
              onClick={() => setEditingCard(card)}
            >
              <span>
                <div className="border-b-solid border-b-[1px] border-b-[#eee] pb-[5px] font-bold flex justify-between">
                  <span className="truncate max-w-[calc(100%-15px)] whitespace-pre-wrap">
                    {card.title}
                  </span>
                  {column.id === '1' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
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
          const currentBoard = JSON.parse(JSON.stringify(board));
          const columnIdxToChange = currentBoard!.columns.findIndex(
            (col: KanbanBoard<Card>['columns']['0']) =>
              col.id === source?.fromColumnId
          );
          if (source?.fromColumnId === '1' && destination?.toColumnId === '2') {
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
            source?.fromColumnId === '3' &&
            destination?.toColumnId === '2'
          ) {
            set(
              currentBoard!,
              [
                'columns',
                columnIdxToChange,
                'cards',
                source.fromPosition,
                'endDate'
              ],
              null
            );
          } else if (
            source?.fromColumnId === '2' &&
            destination?.toColumnId === '1'
          ) {
            set(
              currentBoard!,
              [
                'columns',
                columnIdxToChange,
                'cards',
                source.fromPosition,
                'startDate'
              ],
              null
            );
          } else if (
            source?.fromColumnId === '3' &&
            destination?.toColumnId === '1'
          ) {
            set(
              currentBoard!,
              [
                'columns',
                columnIdxToChange,
                'cards',
                source.fromPosition,
                'startDate'
              ],
              null
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
              null
            );
          } else if (
            source?.fromColumnId === '1' &&
            destination?.toColumnId === '3'
          ) {
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
          }
          trigger(moveCard(currentBoard, source, destination));
        }}
        onCardRemove={(info) => {
          trigger(removeCard(info.board, info.column, info.card));
        }}
        onColumnDragEnd={(_column, source, destination) => {
          const currentBoard = JSON.parse(JSON.stringify(board));
          trigger(moveColumn(currentBoard, source, destination));
        }}
        onColumnRemove={(info) => {
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
      <Modal
        open={!!editingCard}
        onClose={() => setEditingCard(null)}
        classNames={{
          modal: 'w-[600px] [&&]:max-w-[calc(100%-2.4rem)]',
          modalContainer: '[&&]:overflow-x-auto'
        }}
        center
      >
        <h2 className="w-full mb-[15px]">Change Show Information</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const currentBoard = JSON.parse(JSON.stringify(board));
            trigger(
              changeCard(currentBoard!, editingCard?.id, {
                id: uuid(),
                title: (e.target as any)?.title?.value,
                link: (e.target as any)?.link?.value,
                startDate: (e.target as any)?.startDate?.value
                  ? moment((e.target as any)?.startDate?.value).format(
                      'MMM DD YYYY, HH:mm'
                    )
                  : '-',
                endDate: (e.target as any)?.endDate?.value
                  ? moment((e.target as any)?.endDate?.value).format(
                      'MMM DD YYYY, HH:mm'
                    )
                  : '-'
              })
            );
            setEditingCard(null);
          }}
          className="flex flex-col w-full items-start gap-[15px]"
        >
          <label className="w-full flex flex-col">
            <div>
              Title<span className="text-red-500 ml-[2px]">*</span>
            </div>
            <input
              defaultValue={editingCard?.title ?? ''}
              type="text"
              name="title"
              className="border-solid border-[1px] border-[#000] p-[2px]"
            />
          </label>
          <label className="w-full flex flex-col">
            <div>
              Link<span className="text-red-500 ml-[2px]">*</span>
            </div>
            <input
              defaultValue={editingCard?.link ?? ''}
              type="text"
              name="link"
              className="border-solid border-[1px] border-[#000] p-[2px]"
            />
          </label>
          {!!editingCard?.startDate && (
            <label className="w-full flex flex-col">
              Start Date
              <input
                defaultValue={moment(editingCard?.startDate).format(
                  'YYYY-MM-DD HH:mm:ss'
                )}
                type="datetime-local"
                name="startDate"
                className="border-solid border-[1px] border-[#000] p-[2px]"
              />
            </label>
          )}
          {!!editingCard?.endDate && (
            <label className="w-full flex flex-col">
              End Date
              <input
                defaultValue={moment(editingCard?.endDate).format(
                  'YYYY-MM-DD HH:mm:ss'
                )}
                type="datetime-local"
                name="endDate"
                className="border-solid border-[1px] border-[#000] p-[2px]"
              />
            </label>
          )}
          <button
            type="submit"
            className="border-solid border-[1px] border-[#000] p-[6px] bg-[#e0e0e0] mt-[15px]"
          >
            Edit Show
          </button>
        </form>
      </Modal>
    </>
  );

  function findColumnByCardId(cardId: string) {
    return board!.columns.find(
      (column) => column.cards.filter((card) => card.id === cardId).length > 0
    );
  }
}

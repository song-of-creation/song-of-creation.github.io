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
import classNames from 'classnames';
import { set } from 'lodash';
import moment from 'moment';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Modal } from 'react-responsive-modal';
import { GridLoader } from 'react-spinners';
import { v4 as uuid } from 'uuid';

import { useBoardApiRequests } from '@/hooks';
import type { Notification } from './kanbanBoardTypes';

interface Props {
  openedCardId: string | null;
  showNotification: (notification: Notification | null) => void;
}

export function KanbanBoard({
  openedCardId,
  showNotification
}: Readonly<Props>) {
  const [board, setBoard] = useState<KanbanBoard<
    Card & { link: string; startDate?: string; endDate?: string }
  > | null>(null);
  const [editingCard, setEditingCard] = useState<
    (Card & { link: string; startDate?: string; endDate?: string }) | null
  >(null);
  const [editingColumn, setEditingColumn] = useState<
    | KanbanBoard<
        Card & { link: string; startDate?: string; endDate?: string }
      >['columns']['0']
    | null
  >(null);
  const { getBoard, error, isLoading, putBoard } =
    useBoardApiRequests(setBoard);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    getBoard()
      .then((board) => {
        if (openedCardId && board) {
          setEditingCard(findCardByCardId(openedCardId, board)!);
          setEditingColumn(findColumnByCardId(`${openedCardId}`, board)!);
        }
      })
      .catch(() => {});
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
      putBoard(
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

  if (!board || error) {
    return null;
  }

  if (isLoading) {
    return (
      <GridLoader
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        color="#101720"
        size={25}
        aria-label="Loading Spinner"
        loading
      />
    );
  }

  return (
    <>
      <ControlledBoard
        renderColumnHeader={(column) => {
          return (
            <span className="uppercase truncate block font-bold pl-[5px] pt-[10px] pb-[20px]">
              {column?.title}
              <span className="ml-[10px]">{column?.cards?.length}</span>
            </span>
          );
        }}
        renderCard={(card) => {
          const column = findColumnByCardId(`${card.id}`)!;
          return (
            <div
              className={classNames(
                'p-[10px] w-full mb-[10px] rounded-[12px] md:rounded-[4px] hover:bg-[#e6f4ff]',
                {
                  'bg-[#e6f4ff]': editingCard?.id === card.id,
                  'bg-[#fff]': editingCard?.id !== card.id
                }
              )}
              onClick={() => {
                setEditingCard(card);
                setEditingColumn(findColumnByCardId(`${card.id}`)!);
                const queryParams = new URLSearchParams(searchParams);
                queryParams.set('openedCardId', `${card?.id ?? ''}`);
                router.replace(`${pathname}?${queryParams.toString()}`);
              }}
            >
              <span>
                <div className="border-b-solid border-b-[1px] border-b-[#eee] pb-[5px] font-bold flex justify-between">
                  <span className="truncate whitespace-pre-wrap">
                    {card.title}
                  </span>
                  <div className="flex gap-[4px] ml-[6px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const queryParams = new URLSearchParams();
                        queryParams.set('openedCardId', `${card?.id ?? ''}`);
                        const url = `${
                          window.location.origin
                        }${pathname}?${queryParams.toString()}`;
                        navigator.clipboard.writeText(url);
                        showNotification({
                          type: 'info',
                          message: (
                            <div className="flex items-center w-full">
                              <span className="font-bold mr-[4px]">✓</span>
                              Copied to clipboard!
                              <button
                                className="font-semibold text-[20px] ml-[auto]"
                                onClick={() => showNotification(null)}
                              >
                                ×
                              </button>
                            </div>
                          )
                        });
                      }}
                      className="cursor-pointer rounded-[4px] hover:bg-[#cbe1ff]"
                    >
                      <Image
                        className="min-w-[16px]"
                        src="/share-line.svg"
                        alt="icon"
                        width={16}
                        height={16}
                      />
                    </button>
                    {column.id === '1' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentBoard = JSON.parse(
                            JSON.stringify(board)
                          );
                          putBoard(removeCard(currentBoard, column, card));
                        }}
                        className="cursor-pointer rounded-[4px] text-[20px] leading-[16px] hover:bg-[#cbe1ff] w-[16px]"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </span>
              <div className="pt-[10px]">
                <div className="flex flex-col w-full gap-[10px]">
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
          putBoard(moveCard(currentBoard, source, destination));
        }}
        onCardRemove={(info) => {
          putBoard(removeCard(info.board, info.column, info.card));
        }}
        onColumnDragEnd={(_column, source, destination) => {
          const currentBoard = JSON.parse(JSON.stringify(board));
          putBoard(moveColumn(currentBoard, source, destination));
        }}
        onColumnRemove={(info) => {
          putBoard(removeColumn(info.board, info.column));
        }}
        allowAddColumn={false}
        allowRemoveColumn={false}
        allowRenameColumn={false}
        allowAddCard={false}
        allowRemoveCard
        disableColumnDrag
      >
        {board}
      </ControlledBoard>
      <Modal
        open={!!editingCard && !!editingColumn}
        onClose={() => {
          setEditingCard(null);
          setEditingColumn(null);
          router.replace(pathname);
        }}
        classNames={{
          modal:
            'w-[600px] [&&]:max-w-[calc(100%-2.4rem)] rounded-[12px] md:rounded-[4px]',
          modalContainer: '[&&]:overflow-x-auto'
        }}
        center
      >
        <h2 className="w-full mb-[15px]">Change Show Information</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const currentBoard = JSON.parse(JSON.stringify(board));
            const startDate = moment((e.target as any)?.startDate?.value);
            const endDate = moment((e.target as any)?.endDate?.value);
            putBoard(
              changeCard(currentBoard!, editingCard?.id, {
                id: uuid(),
                title: (e.target as any)?.title?.value,
                link: (e.target as any)?.link?.value,
                startDate:
                  editingColumn?.id !== '1' && startDate.isValid()
                    ? startDate.format('MMM DD YYYY, HH:mm')
                    : '',
                endDate:
                  editingColumn?.id === '3' && endDate.isValid()
                    ? endDate.format('MMM DD YYYY, HH:mm')
                    : '-'
              })
            );
            setEditingCard(null);
            setEditingColumn(null);
            router.replace(pathname);
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
              className="border-solid border-[1px] border-[#000] p-[2px] rounded-[4px]"
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
              className="border-solid border-[1px] border-[#000] p-[2px] rounded-[4px]"
            />
          </label>
          {editingColumn?.id !== '1' && (
            <label className="w-full flex flex-col">
              Start Date
              <input
                defaultValue={moment(editingCard?.startDate).format(
                  'YYYY-MM-DD HH:mm:ss'
                )}
                type="datetime-local"
                name="startDate"
                className="border-solid border-[1px] border-[#000] p-[2px] rounded-[4px]"
              />
            </label>
          )}
          {editingColumn?.id === '3' && (
            <label className="w-full flex flex-col">
              End Date
              <input
                defaultValue={moment(editingCard?.endDate).format(
                  'YYYY-MM-DD HH:mm:ss'
                )}
                type="datetime-local"
                name="endDate"
                className="border-solid border-[1px] border-[#000] p-[2px] rounded-[4px]"
              />
            </label>
          )}
          <button
            type="submit"
            className="border-solid border-[1px] border-[#000] p-[6px] bg-[#e0e0e0] mt-[15px] rounded-[4px]"
          >
            Edit Show
          </button>
        </form>
      </Modal>
    </>
  );

  function findCardByCardId(
    cardId: string,
    customBoard?: KanbanBoard<
      Card & { link: string; startDate?: string; endDate?: string }
    >
  ) {
    const column = findColumnByCardId(cardId, customBoard);
    return column?.cards?.find((card) => card?.id === cardId);
  }

  function findColumnByCardId(
    cardId: string,
    customBoard?: KanbanBoard<
      Card & { link: string; startDate?: string; endDate?: string }
    >
  ) {
    return (customBoard ?? board)!.columns.find(
      (column) => column.cards.filter((card) => card.id === cardId).length > 0
    );
  }
}

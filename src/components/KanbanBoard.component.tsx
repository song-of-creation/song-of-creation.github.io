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
import { GridLoader } from 'react-spinners';
import { v4 as uuid } from 'uuid';

export function KanbanBoard() {
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
  const { fetchBoard, error, isLoading, trigger } = usePostBoard(setBoard);

  useEffect(() => {
    fetchBoard();
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

  if (!board || error) {
    return null;
  }

  if (isLoading) {
    return (
      <GridLoader
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        color="#000"
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
            <span className="uppercase truncate block text-[#777] font-bold pl-[5px] pt-[10px] pb-[20px]">
              {column?.title}
              <span className="ml-[10px]">{column?.cards?.length}</span>
            </span>
          );
        }}
        renderCard={(card) => {
          const column = findColumnByCardId(`${card.id}`)!;
          return (
            <div
              className="bg-[#fff] p-[10px] w-full mb-[10px] rounded-[4px] hover:bg-[rgba(255,171,0,0.10)]"
              onClick={() => {
                setEditingCard(card);
                setEditingColumn(findColumnByCardId(`${card.id}`)!);
              }}
            >
              <span>
                <div className="border-b-solid border-b-[1px] border-b-[#eee] pb-[5px] font-bold flex justify-between">
                  <span className="truncate whitespace-pre-wrap">
                    {card.title}
                  </span>
                  {column.id === '1' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const currentBoard = JSON.parse(JSON.stringify(board));
                        trigger(removeCard(currentBoard, column, card));
                      }}
                      className="cursor-pointer rounded-[4px]"
                    >
                      X
                    </button>
                  )}
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
        disableColumnDrag
      >
        {board}
      </ControlledBoard>
      <Modal
        open={!!editingCard}
        onClose={() => {
          setEditingCard(null);
          setEditingColumn(null);
        }}
        classNames={{
          modal: 'w-[600px] [&&]:max-w-[calc(100%-2.4rem)] rounded-[4px]',
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
            trigger(
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

  function findColumnByCardId(cardId: string) {
    return board!.columns.find(
      (column) => column.cards.filter((card) => card.id === cardId).length > 0
    );
  }
}

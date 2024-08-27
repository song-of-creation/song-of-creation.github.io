'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Modal } from 'react-responsive-modal';

import { KanbanBoard } from '@/components';

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthorizationModalOpen, setIsAuthorizationModalOpen] =
    useState(true);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <>
      <header className="sticky w-full h-[60px] flex items-center p-[10px] border-b-[1px] border-b-solid border-b-[#dddee1] gap-[10px]">
        <Image src="/dashboard-line.svg" alt="icon" width={32} height={32} />
        <span className="text-[24px]">Watchalong</span>
        <button
          onClick={() => setIsAddCardModalOpen(true)}
          className="border-solid border-[1px] border-[#ccc] p-[6px] bg-[#eee] ml-[25px] rounded-[4px]"
        >
          Add Show
        </button>
        <Image
          src="/question-line.svg"
          alt="icon"
          width={32}
          height={32}
          className="ml-auto cursor-pointer"
          onClick={() => setIsHelpModalOpen(true)}
        />
      </header>
      <main className="overflow-auto h-[calc(100%-60px)] relative">
        {isAuthorized && <KanbanBoard />}
      </main>
      <Modal
        open={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        classNames={{
          modal: 'w-[600px] [&&]:max-w-[calc(100%-2.4rem)]',
          modalContainer: '[&&]:overflow-x-auto'
        }}
        center
      >
        <h2 className="w-full mb-[15px]">Enter Show Information</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.dispatchEvent(
              new CustomEvent('com.watchalong.addCard', {
                detail: {
                  title: (e.target as any).title.value,
                  link: (e.target as any).link.value
                }
              })
            );
            setIsAddCardModalOpen(false);
          }}
          className="flex flex-col w-full items-start gap-[15px]"
        >
          <label className="w-full flex flex-col">
            <div>
              Title<span className="text-red-500 ml-[2px]">*</span>
            </div>
            <input
              type="text"
              name="title"
              className="border-solid border-[1px] border-[#000] p-[2px]"
              required
            />
          </label>
          <label className="w-full flex flex-col">
            <div>
              Link<span className="text-red-500 ml-[2px]">*</span>
            </div>
            <input
              type="text"
              name="link"
              className="border-solid border-[1px] border-[#000] p-[2px]"
              required
            />
          </label>
          <button
            type="submit"
            className="border-solid border-[1px] border-[#000] p-[6px] bg-[#e0e0e0] mt-[15px]"
          >
            Add Show
          </button>
        </form>
      </Modal>
      <Modal
        open={isAuthorizationModalOpen}
        onClose={() => {}}
        classNames={{
          modal: 'w-[600px] [&&]:max-w-[calc(100%-2.4rem)]',
          modalContainer: '[&&]:overflow-x-auto'
        }}
        center
      >
        <h2 className="w-full mb-[15px]">Enter Password</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              (e.target as any)?.password?.value !==
              process.env.NEXT_PUBLIC_PASSWORD
            ) {
              return;
            }
            setIsAuthorized(true);
            setIsAuthorizationModalOpen(false);
          }}
          className="flex flex-col w-full items-start gap-[15px]"
        >
          <label className="w-full flex flex-col">
            <div>
              Password<span className="text-red-500 ml-[2px]">*</span>
            </div>
            <input
              type="text"
              name="password"
              className="border-solid border-[1px] border-[#000] p-[2px]"
              required
            />
          </label>
          <button
            type="submit"
            className="border-solid border-[1px] border-[#000] p-[6px] bg-[#e0e0e0] mt-[15px]"
          >
            Submit
          </button>
        </form>
      </Modal>
      <Modal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        classNames={{
          modal: 'w-[600px] [&&]:max-w-[calc(100%-2.4rem)]',
          modalContainer: '[&&]:overflow-x-auto'
        }}
        center
      >
        <h2 className="font-bold text-center text-[18px]">Help</h2>
        <ul className="text-[16px] list-disc m-[inherit] p-[inherit]">
          <li>There are only 3 columns: Can Watch, Watching, and Watched.</li>
          <li>
            You can add a show to Can Watch by pressing the Add Show button at
            the top and completing the information.
          </li>
          <li>
            You can drag and drop a show to Watching when we start watching the
            show. It will automatically add a start date from the moment you
            moved the show.
          </li>
          <li>
            You can drag and drop a show to Watched when we either finish
            watching the show, or when we drop it. It will automatically add an
            end date from the moment you moved the show.
          </li>
          <li>
            You can remove shows from the board but only the ones from Can
            Watch. To remove ones from other columns, you have to drag and drop
            them to Can Watch.
          </li>
          <li>
            You can edit the information of an existing show by clicking on it
            and completing the information.
          </li>
          <li>
            For better readability, all shows are automatically sorted starting
            from the most recent finished show to the oldest finished show. When
            the finish date doesn&apos;t exist, the sorting is done starting
            from the most recent started show to the oldest started show.
          </li>
        </ul>
      </Modal>
    </>
  );
}

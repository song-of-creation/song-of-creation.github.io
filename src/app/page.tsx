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
      </header>
      <main className="overflow-auto h-[calc(100%-60px)]">
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
    </>
  );
}

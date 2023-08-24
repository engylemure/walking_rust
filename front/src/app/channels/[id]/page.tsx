'use client';

import { Loader } from "@/components/Loader";
import { useApiEnv } from "@/containers/ApiEnv";
import { useAuthContext } from "@/containers/Auth";
import { User } from "@/storage/auth";
import { customFetch, getApiUrl } from "@/utils/api";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import useSWR, { KeyedMutator, mutate } from 'swr';

type Channel = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  messages: MessageModel[]
}


type MessageModel = {
  id: number;
  content: string;
  user: {
    id: number
    user_name: string
  }
  channel_id: number;
  created_at: string;
  updated_at: string;
}

function channelFetcher(path: string) {
  return customFetch<Channel>(path)
}

export default function Channel({ params }: { params: { id: string } }) {

  const { auth } = useAuthContext();
  const id = Number(params.id);
  const { data, isLoading, mutate } = useSWR(`channels/${id}`, channelFetcher);
  useEffect(() => {
    if (data) {
      console.log(data.id)
      document.title = data.name
    }
  }, [data])
  if (auth.state !== 'authenticated' || isLoading || !data) {
    return <Loader />
  }
  return (
    <main className="flex flex-col relative overflow-y-auto gap-1 h-full relative py-10 px-10">
      <ChannelContent user={auth.user} {...data} mutate={mutate} />
    </main>
  )
}


function ChannelContent({ mutate, user, ...channel }: Channel & { mutate: KeyedMutator<Channel>, user: User }) {
  const socketRef = useRef<WebSocket>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const { id, name } = channel;
  const { env } = useApiEnv();
  const messageForm = useForm<{ message: string }>();
  useEffect(() => {
    function onOpen() {
      setTimeout(() => {
        socketRef.current?.send(JSON.stringify({ type: 'subscribe', data: { channelId: id } }));
      }, 100);
    }
    function onMessage(event: MessageEvent<string>) {
      const msg: ApiMessage = JSON.parse(event.data);
      switch (msg.type) {
        case "channelMessage":
          mutate<Channel>((data) => {
            if (!data) return undefined;
            return {
              ...data,
              messages: [
                ...data.messages,
                msg.data
              ]
            }
          })
        case "isCalculating":
      }
    }
    if (env) {
      socketRef.current = new WebSocket(getApiUrl('ws', env).replace('http', 'ws'));
      socketRef.current.addEventListener('open', onOpen);
      socketRef.current.addEventListener('message', onMessage);
      socketRef.current.addEventListener('close', () => socketRef.current = undefined)
    }
    return () => {
      socketRef.current?.close();
      socketRef.current = undefined;
    }
  }, [id, env]);
  const onSend = messageForm.handleSubmit(({ message }) => {
    if (message) {
      socketRef.current?.send(JSON.stringify({ type: 'sendMessage', data: { channelId: id, content: message } }));
      messageForm.reset({ message: '' });
    }
  });
  const messages = useMemo(() => channel.messages, [channel.messages]);
  return (
    <>
      <p className="text-semibold text-md sticky top-0 bg-white p-4 border rounded-md">{name}</p>
      {messages.map((message) => (
        <MessageComponent key={message.id} {...message} isOwn={message.user.id === user.id} />
      ))}
      <div className="flex flex-row gap-2 sticky bottom-0 p-5 bg-white">
        <input {...messageForm.register('message')} className="bg-blue-200 rounded-md p-2 min-w-[400px]" />
        <button className="border rounded-md p-2" disabled={!messageForm.watch('message')} onClick={onSend}>Send</button>
      </div>
    </>
  )
}

const MessageComponent = ({ isOwn, ...data }: MessageModel & { isOwn: boolean }) => (
  <div id={data.id.toString()} className={`flex flex-row flex-1 w-full  ${isOwn ? 'justify-flex-end text-end' : ''}`}>
    <span id={`#${data.id}`} className={`w-full gap-2 p-4 text-slate-900 flex flex-col border-2 border-solid border-slate-400 bg-white rounded-md ${isOwn ? 'own' : ''}`}>
      < b > {data.user.user_name}</b>
      <p>{data.content}</p>
      <span className="text-xs">{new Date(data.created_at).toLocaleString()}</span>
    </span>
  </div >
)


type ApiMessage = {
  type: 'channelMessage',
  data: MessageModel
} | {
  type: 'isCalculating',
  data: {
    value: boolean
  }
}
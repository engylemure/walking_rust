'use client';
import { customFetch } from "@/utils/api"
import { useAuthContext } from "./Auth";
import useSWR from 'swr';
import Link from "next/link";
import { Loader } from "@/components/Loader";
import { ApiEnv } from "@/storage/env";
import { useApiEnv } from "./ApiEnv";

type Channel = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

function channelsFetcher(_: any, env: ApiEnv) {
  return customFetch<Channel[]>('channels')
}

export const Channels = () => {
  const { auth } = useAuthContext();
  if (auth.state !== 'authenticated') {
    return null
  }
  return <_Channels />
}

const _Channels = () => {
  const { env } = useApiEnv()
  const { data, isLoading } = useSWR('channels', (key) => channelsFetcher(key, env));
  return (
    <div className="flex flex-col gap-2 pt-4">
      <p className="text-semibold">Channels</p>
      {isLoading && <Loader />}
      {data && data.map(Channel)}
    </div>
  )
}


const Channel = (props: Channel) => {
  return (
    <Link href={`/channels/${props.id}`}>{props.name}</Link>
  )
}



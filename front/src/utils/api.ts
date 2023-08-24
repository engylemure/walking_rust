import { ApiEnv } from "@/storage/env";

export function getApiUrl(path: string, type: 'rust' | 'node' = 'node') {
  const apiUrl = type === 'rust' ? process.env.NEXT_PUBLIC_RUST_API : process.env.NEXT_PUBLIC_NODE_API
  return `${apiUrl}/${path}`
}



export async function customFetch<T, Payload extends Record<string, any> = {}>(
  path: string, 
  { 
    payload = {} as Payload,
    method,
    env
  }: { 
    method: 'GET' | 'POST',
    payload?: typeof method extends 'GET' ? undefined : Payload,
    env: ApiEnv
  } = { method: 'GET', env: 'rust' }): Promise<T> {
  const response = await fetch(getApiUrl(path, env), {
    method,
    body: method === 'POST' && payload ? JSON.stringify(payload) : undefined,
    headers: {
      ['Content-Type']: 'application/json',
    },
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error(`Response not ok for '${path} at ${env}'`)
  }
  return response.json().catch(console.error)
}
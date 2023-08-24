import { User } from '@/components/User'
import { Channels } from '@/containers/Channels'

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl h-full w-full items-center gap-4 font-mono text-sm flex flex-col">
        <User />
        <Channels />
      </div>
    </main>
  )
}

'use client';

import { useAuthContext } from "@/containers/Auth";
import { useForm } from 'react-hook-form';
import Toggle from 'react-toggle';
import "react-toggle/style.css";

export const User = () => {
  const { login, signup, auth, logout } = useAuthContext();
  const form = useForm<{ userName: string, isSignup: boolean }>();
  const onSubmit = form.handleSubmit((data, ev) => {
    ev?.preventDefault();
    const action = data.isSignup ? signup.trigger : login.trigger
    action(data.userName);
  })
  if (auth.state === 'authenticated') {
    return (
      <div className="flex flex-col gap-2">
        <div>Hi {auth.user.user_name} </div>
        <button onClick={() => logout.trigger()} className="border rounded-md p-2">LogOut</button>
      </div>
    )
  }
  return (
    <form className="flex flex-col gap-2" onSubmit={onSubmit}>
      <label className="flex flex-row items-center justify-center gap-2">
        <Toggle
          defaultChecked={form.watch('isSignup')}
          icons={false}
          onChange={(event) => {
            form.setValue('isSignup', event.target.checked)
          }} />
        <span>{form.watch('isSignup') ? 'SignUp' : 'Login'}</span>
      </label>

      <input className="text-black bg-blue-200 rounded-md p-2" {...form.register('userName')} />

      <button type="submit" className="border rounded-md p-2" disabled={login.isMutating || signup.isMutating || !form.watch('userName')}>{form.watch('isSignup') ? 'SignUp' : 'Login'}</button>
    </form>
  )
}
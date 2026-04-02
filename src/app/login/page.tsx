import { login } from './actions'
import Link from 'next/link'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string, message?: string }> }) {
  const params = await props.searchParams;

  return (
    <div className="w-full flex justify-center mt-24">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-sm rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign in to AdFlow Pro</h2>
        
        {params?.error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-md mb-4 text-sm font-medium">
            {params.error}
          </div>
        )}

        {params?.message && (
          <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-md mb-4 text-sm font-medium">
            {params.message}
          </div>
        )}

        <form className="flex flex-col gap-4" action={login}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email:</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-600 outline-none" 
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password:</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-600 outline-none" 
            />
          </div>
          
          <button 
            type="submit" 
            className="bg-blue-600 text-white font-medium p-2 rounded-md hover:bg-blue-700 transition"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

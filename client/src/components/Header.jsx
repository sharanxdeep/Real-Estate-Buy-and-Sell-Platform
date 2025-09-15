import React from 'react'
import { Link } from 'react-router-dom'
export default function header() {
  return (
    <header className='bg-purple-50 shadow-md text-2xl my-1 p-2'>
          <div className='flex items-center justify-between max-w-5xl mx-auto'>
          <Link to='/'>
            <h1 className='font-bold'>
              <span className='text-slate-400'>Safe</span>
              <span>Roof</span>
            </h1>
          </Link> 
            <div className='flex gap-5 items-centre'>
              <form className='bg-white rounded-lg'>
              <input className='p-2 shadow-md' type="text" placeholder='Search'/>
            </form>
            <button className='bg-purple-200 hover:bg-purple-600 rounded-lg p-2'>Go</button>
            </div>
            <ul className='flex gap-10'>
              <Link to='/'><li className='hover:underline'>Home</li></Link>
              <Link to='/About'><li className='hover:underline'>About</li></Link>
              <Link to='/LogIn'><li className='hover:underline'>Log In</li></Link>
            </ul>
            </div>
    </header>
  )
}

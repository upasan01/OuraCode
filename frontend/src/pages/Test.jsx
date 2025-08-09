import React from 'react'
import Particles from '../components/ui/particles'
import { Code2 } from 'lucide-react'

const Test = () => {
  return (
    <div className='relative w-screen h-screen overflow-hidden bg-black items-center justify-center flex'>
      <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-gradient-to-br from-[#a6e3a1] to-[#89b4fa]">
        <Code2 className="h-24 w-24 text-[#1e1e2e]" />
      </div>
    </div>
  )
}

export default Test


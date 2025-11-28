import React from 'react'
import Connection from './Connection'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
function Header({title}) {
  return (
    <div className='flex items-center justify-between flex-row w-full p-2 border-b-1 border-gray-300'>
      <div className='flex flex-row gap-3 items-center'> {/*Title*/}
        <div className="flex items-center justify-center rounded-md bg-blue-600 p-2 ">
          <PrecisionManufacturingIcon className='text-white'fontSize='medium'/>
        </div>
        <p className='text-lg'>
          {title}
        </p>
      </div>

      <Connection/>
    </div>
  )
}

export default Header
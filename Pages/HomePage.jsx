import React from 'react'
import Homepage from '../Components/Homepage/Homepage'
import PreventBack from './PreventBack'

const HomePage = ({messageNo,role}) => {
  return (
    <div>
        <PreventBack/>
      <Homepage messageNo={messageNo} role={role}/>
    </div>
  )
}

export default HomePage

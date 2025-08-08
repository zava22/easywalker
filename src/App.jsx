import React, { useContext } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/Main/Main'
import { Context } from './context/Context'

const App = () => {
  const { sidebarOpen } = useContext(Context);

  return (
    <div className="app">
      <Sidebar />
      <Main />
    </div>
  )
}

export default App
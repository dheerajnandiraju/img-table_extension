import './App.css'

import DownloadImages from './DownloadImages'
import DownloadTabels from './DownloadTables'


const App = () => {
  return (
    <div className="App">
      <DownloadTabels/>
      <DownloadImages />
    </div>
  )
}

export default App
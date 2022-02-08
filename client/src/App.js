import {
  Route,
  Switch
} from 'react-router-dom'
import { Home } from './pages'


const App = () => {

  return (
    <div id="main">
      <Switch>
        <Route exact path='/' >
          <Home />
        </Route>
        {/* <Page404 /> */}
      </Switch>
    </div>
  )
}

export default App

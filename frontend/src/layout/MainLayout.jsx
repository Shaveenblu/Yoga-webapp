import { router } from "../routes/router"
import { Outlet } from "react-router-dom"
import NavBar from '../components/headers/NavBar'


const MainLayout = () => {
    return(
        <main className="dark: bg-white overflow-hidden">
        <NavBar/>
        <div>
            <Outlet/>
        </div>
        <footer>Footer</footer>
        </main>
    )
}

export default MainLayout
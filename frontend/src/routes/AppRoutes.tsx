import { Route, Routes } from "react-router-dom";
import Welcome from "../pages/welcome/welcome";
import AppLayout from "../components/layouts/AppLayout";
import Dashboard from "../pages/dashboard/Dashbaord";



export const AppRoutes = () =>  {
    return (
        <Routes>
                 {/* Public Routes */}
            <Route element={<AppLayout />}>
                <Route path="/" element={<Welcome />} />
                <Route path="/dashboard" element={<Dashboard />} />       
             </Route>
        
        </Routes>
    )
}


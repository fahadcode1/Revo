import { Route, Routes } from "react-router-dom";
import Welcome from "../pages/welcome/welcome";
import AppLayout from "../components/layouts/AppLayout";
import Dashboard from "../pages/dashboard/Dashbaord";
import CustomersPage from "../pages/customer/CustomersPage";
import ManageCustomerPage from "../pages/management/ManageCustomerPage";
import RecoveryPage from "../pages/recovery/RecoveryPage";
import RecoveryCaseDetailPage from "../pages/recovery/RecoveryCaseDetailPage";
import ActivityPage from "../pages/activity/ActivityPage";
import SettingsPage from "../pages/setting/SettingsPage";


export const AppRoutes = () =>  {
    return (
        <Routes>
                 {/* Public Routes */}
            <Route element={<AppLayout />}>
                <Route path="/" element={<Welcome />} />
                <Route path="/dashboard" element={<Dashboard />} />       
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/management" element={<ManageCustomerPage />} />
                <Route path="/recovery" element={<RecoveryPage />} />
                <Route path="/recovery/:recoveryCaseId" element={<RecoveryCaseDetailPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/settings" element={<SettingsPage />} />

             </Route>
        </Routes>
    )
}


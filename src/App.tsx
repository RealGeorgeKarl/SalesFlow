import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PersonaProvider } from './contexts/PersonaContext';
import { SettingsProvider } from './contexts/SettingsContext';
import LoginForm from './components/auth/LoginForm';
import PersonaSelection from './components/persona-selection/PersonaSelection';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import NewSale from './components/sales/NewSale';
import SalesList from './components/sales/SalesList';
import CustomersList from './components/customers/CustomersList';
import PersonaManagement from './components/admin/PersonaManagement';
import SubscriptionDetails from './components/admin/SubscriptionDetails';
import ProductManagement from './components/products/ProductManagement';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AuthFlow: React.FC = () => {
  const { user, persona, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  if (user && !persona) {
    return (
      <PersonaProvider>
        <PersonaSelection />
      </PersonaProvider>
    );
  }

  return <LoginForm />;
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthFlow />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="new-sale" element={<NewSale />} />
            <Route path="sales" element={<SalesList />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="persona-management" element={<PersonaManagement />} />
            <Route path="subscription" element={<SubscriptionDetails />} />
            {/* Add more routes as needed */}
          </Route>
        </Routes>
      </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
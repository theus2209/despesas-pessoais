import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import BudgetRulePage from '@/pages/BudgetRulePage';
import ExpensesPage from '@/pages/ExpensesPage';
import CategoriesPage from '@/pages/CategoriesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" theme="dark" />
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/budget" replace />} />
            <Route path="/budget" element={<BudgetRulePage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="*" element={<Navigate to="/budget" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

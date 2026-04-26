import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../config/api';
import { applyRecurringMovements } from '../utils/recurringMovements';
import Sidebar from './Sidebar';
import Toast from './Toast';

function Layout({ children }) {
  const [toast, setToast] = useState(null);
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    async function checkAlerts() {
      applyRecurringMovements(currentUser);

      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_URL}/api/movements`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const movements = response.ok ? await response.json() : [];
        const budgets = JSON.parse(localStorage.getItem('budgets')) || [];

        const currentMonth = new Date().toISOString().slice(0, 7);

        const monthMovements = movements.filter((m) => m.type === 'expense' && m.date?.startsWith(currentMonth));

        const userBudgets = budgets.filter((b) => b.userId === currentUser?.id && b.month === currentMonth);

        function getSpentByCategory(category) {
          return monthMovements.filter((m) => m.category === category).reduce((sum, m) => sum + Number(m.amount), 0);
        }

        const alerts = userBudgets
          .map((budget) => {
            const spent = getSpentByCategory(budget.category);
            const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

            if (percentage > 100) {
              return {
                type: 'danger',
                title: `${budget.category} ha superado el presupuesto`,
              };
            }

            if (percentage >= 80) {
              return {
                type: 'warning',
                title: `${budget.category} está cerca del límite`,
              };
            }

            return null;
          })
          .filter(Boolean);

        if (alerts.length > 0) {
          const firstAlert = alerts[0];

          setToast({
            message: firstAlert.title,
            type: firstAlert.type,
          });
        }
      } catch (error) {
        console.error('Error comprobando alertas:', error);
      }
    }

    checkAlerts();
  }, [location.pathname, currentUser?.id]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </>
  );
}

export default Layout;

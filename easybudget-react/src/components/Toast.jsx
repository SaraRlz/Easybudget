import { useEffect, useState } from 'react';
import '../styles/toast.css';

function Toast({ message, type = 'warning', onClose }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      onClose();
    }, 2300);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  return <div className={`toast ${type} ${closing ? 'fade-out' : ''}`}>{message}</div>;
}

export default Toast;

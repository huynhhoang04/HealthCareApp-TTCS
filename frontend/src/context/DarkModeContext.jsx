import { createContext, useState, useEffect } from 'react';

export const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Khởi tạo dark mode từ localStorage khi component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('app_dark_mode') === 'true';
    setIsDarkMode(savedDarkMode);
    
    // Áp dụng class 'dark' vào <html> ngay từ lần load đầu tiên
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    setIsInitialized(true);
  }, []);

  // Mỗi khi isDarkMode thay đổi, cập nhật localStorage và HTML
  useEffect(() => {
    if (!isInitialized) return; // Bỏ qua lần đầu tiên
    
    localStorage.setItem('app_dark_mode', isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, isInitialized]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, isInitialized }}>
      {children}
    </DarkModeContext.Provider>
  );
}

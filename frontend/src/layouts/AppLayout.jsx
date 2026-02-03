import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/shared/Header';
import BottomNav from '../components/shared/BottomNav';

const AppLayout = () => {
  const location = useLocation();
  const isSelectMode = location.pathname === '/tables' && location.state?.selectMode;
  return (
    <>
      {!isSelectMode && <Header />}
      <Outlet />
      {!isSelectMode && <BottomNav />}
    </>
  );
};

export default AppLayout;

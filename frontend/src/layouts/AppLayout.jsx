import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/shared/Header';
import BottomNav from '../components/shared/BottomNav';

const AppLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <BottomNav />
    </>
  );
};

export default AppLayout;

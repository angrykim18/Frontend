import React from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import Header from './Header'; // ✅ Header import 추가
import './DashboardLayout.css';

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <SideBar />
      <div className="main-content-wrapper"> {/* ✅ div로 한 번 더 감쌉니다. */}
        <Header /> {/* ✅ Header 컴포넌트 추가 */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
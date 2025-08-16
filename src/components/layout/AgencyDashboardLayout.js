import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import './Header.css';

// 대리점용 헤더 (로그아웃 및 크레딧 표시)
function AgencyHeader() {
    const navigate = useNavigate();
    const agencyInfo = JSON.parse(sessionStorage.getItem('agency'));

    const handleLogout = () => {
        sessionStorage.removeItem('agency');
        alert('로그아웃 되었습니다.');
        navigate('/agency-login');
    };

    return (
        <header className="main-header">
            <div style={{ marginRight: '20px' }}>
                <strong>{agencyInfo?.agencyName}</strong>
                <span> (남은 크레딧: {agencyInfo?.dateCredits}일)</span>
            </div>
            <button onClick={handleLogout} className="logout-button">로그아웃</button>
        </header>
    );
}

// 대리점용 사이드바
function AgencySideBar() {
  return (
    <div className="sidebar">
      <h2>대리점 페이지</h2>
      <nav>
        <ul>
          <li><Link to="/agency-dashboard/users">사용자 관리</Link></li>
        </ul>
      </nav>
    </div>
  );
}

// 대리점용 전체 레이아웃
function AgencyDashboardLayout() {
  return (
    <div className="dashboard-layout">
      <AgencySideBar />
      <div className="main-content-wrapper">
        <AgencyHeader />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AgencyDashboardLayout;
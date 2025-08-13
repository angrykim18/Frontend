import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 세션 스토리지에서 대리점 정보를 삭제합니다. (최고 관리자는 별도 세션 없음)
    sessionStorage.removeItem('agency');
    alert('로그아웃 되었습니다.');
    navigate('/login'); // 최고 관리자 로그인 페이지로 이동
  };

  return (
    <header className="main-header">
      <button onClick={handleLogout} className="logout-button">로그아웃</button>
    </header>
  );
}

export default Header;
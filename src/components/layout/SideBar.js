import React from 'react';
import { Link } from 'react-router-dom';
import './SideBar.css';

function SideBar() {
  return (
    <div className="sidebar">
      <h2>CMS Menu</h2>
      <nav>
        <ul>
          {/* ✅ 링크 경로를 "/dashboard/users"로 수정합니다. */}
          <li><Link to="/dashboard/users">사용자 관리</Link></li>
          <li><Link to="/dashboard/live">Live 채널 관리</Link></li>
          <li><Link to="/dashboard/vod">VOD 관리</Link></li>
          <li><Link to="/dashboard/agencies">대리점 관리</Link></li>
          <li><Link to="/dashboard/ads">광고 관리</Link></li> 
          <li><Link to="/dashboard/notices">공지사항 관리</Link></li>
          <li><Link to="/dashboard/servers">서버 관리</Link></li>
          <li><Link to="/dashboard/groups">셋탑 그룹 관리</Link></li>
          <li><Link to="/dashboard/updates">앱 업데이트 관리</Link></li>
          <li><Link to="/dashboard/logs">로그 관리</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default SideBar;
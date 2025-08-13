import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 50, totalElements: 0, totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const calculateRemainingDays = (endDate) => {
    if (!endDate) return '-';
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? '만료' : diffDays + '일';
  };

  const fetchUsers = useCallback(async (page, keyword = '') => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users?page=${page}&size=${pageInfo.size}&keyword=${keyword}`);
      console.log("서버로부터 받은 데이터:", response.data);
      setUsers(response.data.content);
      setPageInfo(prev => ({
        ...prev,
        page: response.data.number,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
      }));
    } catch (error) {
      alert("사용자 목록을 불러오는 데 실패했습니다.");
    }
  }, [pageInfo.size]);

  useEffect(() => {
    fetchUsers(0, searchTerm);
  }, [searchTerm, fetchUsers]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchUsers(0, e.target.value);
    }
  };

  const handlePrevPage = () => {
    if (pageInfo.page > 0) {
      fetchUsers(pageInfo.page - 1, searchTerm);
    }
  };

  const handleNextPage = () => {
    if (pageInfo.page < pageInfo.totalPages - 1) {
      fetchUsers(pageInfo.page + 1, searchTerm);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/dashboard/users/edit/${userId}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm(`정말로 이 사용자(ID: ${userId})를 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}`);
        alert('사용자가 삭제되었습니다.');
        fetchUsers(pageInfo.page, searchTerm);
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>사용자 관리</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="기기ID, 관리ID, 이름, 메모로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyPress}
        />
        <button onClick={() => fetchUsers(0, searchTerm)}>검색</button>
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th className="col-index">인덱스</th>
            <th className="col-device-id">기기 ID</th>
            <th className="col-admin-id">관리 ID</th>
            <th className="col-name">이름</th>
            <th className="col-group">그룹</th>
            <th className="col-status">상태</th>
            <th className="col-start-date">시작일자</th>
            <th className="col-end-date">종료일자</th>
            <th className="col-remaining">날짜</th>
            <th className="col-adult">성인</th>
            <th className="col-memo">메모</th>
            <th className="col-ip">IP</th>
            <th className="col-country">국가</th>
            <th className="col-actions">관리</th>
            
          </tr>
        </thead>
        <tbody>
          {users?.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.deviceId}</td>
              <td>{user.managementId}</td>
              <td>{user.name}</td>
              <td>{user.userGroup}</td>
              <td>{user.status}</td>
              <td>{new Date(user.createdAt).toLocaleString('ko-KR')}</td>
              <td>{user.subscriptionEndDate}</td>
              <td>{calculateRemainingDays(user.subscriptionEndDate)}</td>
              <td>{user.adultContentAllowed ? 'O' : 'X'}</td>
              <td>{user.memo}</td>
              <td>{user.ip}</td>
              <td>{user.country}</td>
              <td>
                <button onClick={() => handleEdit(user.id)}>수정</button>
                <button onClick={() => handleDelete(user.id)} style={{marginLeft: '5px'}}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={pageInfo.page === 0}>
          &lt; 이전
        </button>
        <span>
          {Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)} / {pageInfo.totalElements} 명
        </span>
        <button onClick={handleNextPage} disabled={pageInfo.page >= pageInfo.totalPages - 1}>
          다음 &gt;
        </button>
      </div>
    </div>
  );
}

export default UserManagement;
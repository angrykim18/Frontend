import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './UserManagement.css'; // CSS 재사용

function AgencyUserManagement() {
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 50, totalElements: 0, totalPages: 0 });
  const agencyInfo = JSON.parse(sessionStorage.getItem('agency'));

  const fetchUsers = useCallback(async (page) => {
    if (!agencyInfo) {
      alert("대리점 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    try {
      // ✅ 자신에게 속한 사용자 목록만 요청합니다.
      const response = await axios.get(`http://localhost:8081/api/users?agencyId=${agencyInfo.id}&page=${page}&size=${pageInfo.size}`);
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
  }, [agencyInfo, pageInfo.size]);

  useEffect(() => {
    fetchUsers(0);
  }, [fetchUsers]);

  const handlePrevPage = () => { if (pageInfo.page > 0) fetchUsers(pageInfo.page - 1); };
  const handleNextPage = () => { if (pageInfo.page < pageInfo.totalPages - 1) fetchUsers(pageInfo.page + 1); };

  return (
    <div>
      <h1>대리점 사용자 관리</h1>
      <p>'{agencyInfo?.agencyName}' 소속의 사용자 목록입니다.</p>
      
      <table className="user-table">
        <thead>
          <tr>
            <th>관리 ID</th>
            <th>이름</th>
            <th>그룹</th>
            <th>상태</th>
            <th>종료일자</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.managementId}</td>
              <td>{user.name}</td>
              <td>{user.userGroup}</td>
              <td>{user.status}</td>
              <td>{user.subscriptionEndDate}</td>
              <td>
                <button>날짜 충전</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={pageInfo.page === 0}>&lt; 이전</button>
        <span>{pageInfo.page + 1} / {pageInfo.totalPages}</span>
        <button onClick={handleNextPage} disabled={pageInfo.page >= pageInfo.totalPages - 1}>다음 &gt;</button>
      </div>
    </div>
  );
}

export default AgencyUserManagement;
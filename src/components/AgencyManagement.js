import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function AgencyManagement() {
  const [agencies, setAgencies] = useState([]);
  const navigate = useNavigate();

  const fetchAgencies = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/agencies');
      setAgencies(response.data);
    } catch (error) {
      alert("대리점 목록을 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const handleDelete = async (agencyId) => {
    if (window.confirm(`정말로 이 대리점(ID: ${agencyId})을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:8081/api/agencies/${agencyId}`);
        alert('대리점이 삭제되었습니다.');
        fetchAgencies();
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };
  
  const handleCharge = async (agencyId) => {
    const amount = prompt("충전할 날짜 크레딧을 숫자로 입력하세요:");
    if (amount && !isNaN(amount)) {
        try {
            await axios.post(`http://localhost:8081/api/agencies/${agencyId}/charge`, { amount: parseInt(amount) });
            alert('크레딧이 성공적으로 충전되었습니다.');
            fetchAgencies();
        } catch (error) {
            alert('크레딧 충전에 실패했습니다.');
        }
    } else if(amount) {
        alert("숫자만 입력해주세요.");
    }
  };

  return (
    <div>
      <h1>대리점 관리</h1>
      <button onClick={() => navigate('/dashboard/agency/new')} style={{ marginBottom: '20px' }}>
        새 대리점 추가
      </button>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>대리점 이름</th>
            <th>로그인 ID</th>
            <th>보유 크레딧</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {agencies.map(agency => (
            <tr key={agency.id}>
              <td>{agency.id}</td>
              <td>{agency.agencyName}</td>
              <td>{agency.loginId}</td>
              <td>{agency.dateCredits}일</td>
              <td>
                <button onClick={() => handleCharge(agency.id)}>크레딧 충전</button>
                <button onClick={() => navigate(`/dashboard/agency/edit/${agency.id}`)} style={{ marginLeft: '5px' }}>수정</button>
                <button onClick={() => handleDelete(agency.id)} style={{ marginLeft: '5px' }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AgencyManagement;
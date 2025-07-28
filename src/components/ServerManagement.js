import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css'; // 기존 CSS 재사용

function ServerManagement() {
  const [servers, setServers] = useState([]);
  const navigate = useNavigate();

  const fetchServers = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/servers');
      setServers(response.data);
    } catch (error) {
      alert("서버 목록을 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleDelete = async (serverId) => {
    if (window.confirm(`정말로 이 서버(ID: ${serverId})를 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:8081/api/servers/${serverId}`);
        alert('서버가 삭제되었습니다.');
        fetchServers(); // 목록 새로고침
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>서버 관리</h1>
      <button onClick={() => navigate('/dashboard/server/new')} style={{ marginBottom: '20px' }}>
        새 서버 추가
      </button>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>서버 이름</th>
            <th>서버 주소 (URL)</th>
            <th>설명</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {servers.map(server => (
            <tr key={server.id}>
              <td>{server.id}</td>
              <td>{server.serverName}</td>
              <td>{server.serverUrl}</td>
              <td>{server.description}</td>
              <td>
                <button onClick={() => navigate(`/dashboard/server/edit/${server.id}`)}>수정</button>
                <button onClick={() => handleDelete(server.id)} style={{ marginLeft: '5px' }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ServerManagement;
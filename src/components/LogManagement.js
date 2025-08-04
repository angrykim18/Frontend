import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManagement.css'; // 기존 CSS 재사용

function LogManagement() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/logs');
        setLogs(response.data);
      } catch (error) {
        alert("로그 목록을 불러오는 데 실패했습니다.");
      }
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h1>로그 관리</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>로그 타입</th>
            <th>내용</th>
            <th>실행자</th>
            <th>기록 시간</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.logType}</td>
              <td style={{ maxWidth: '600px', whiteSpace: 'pre-wrap' }}>{log.logMessage}</td>
              <td>{log.executorId}</td>
              <td>{new Date(log.createdAt).toLocaleString('ko-KR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LogManagement;
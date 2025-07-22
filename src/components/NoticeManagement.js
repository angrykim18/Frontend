import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function NoticeManagement() {
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  const fetchNotices = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/notices');
      setNotices(response.data);
    } catch (error) {
      alert("공지사항 목록을 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (noticeId) => {
    if (window.confirm(`정말로 이 공지(ID: ${noticeId})를 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:8081/api/notices/${noticeId}`);
        alert('공지사항이 삭제되었습니다.');
        fetchNotices();
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>공지사항 관리</h1>
      <button onClick={() => navigate('/dashboard/notice/new')} style={{ marginBottom: '20px' }}>
        새 공지사항 작성
      </button>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>내용</th>
            <th>타겟 그룹</th>
            <th>상태</th>
            <th>작성일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {notices.map(notice => (
            <tr key={notice.id}>
              <td>{notice.id}</td>
              <td style={{ maxWidth: '500px', whiteSpace: 'pre-wrap' }}>{notice.content}</td>
              <td>{notice.targetGroup}</td>
              <td>{notice.active ? '활성' : '비활성'}</td>
              <td>{new Date(notice.createdAt).toLocaleString('ko-KR')}</td>
              <td>
                <button onClick={() => navigate(`/dashboard/notice/edit/${notice.id}`)}>수정</button>
                <button onClick={() => handleDelete(notice.id)} style={{ marginLeft: '5px' }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NoticeManagement;
import React, { useState, useEffect, useCallback } from 'react'; // ✅ useCallback 추가
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function LiveManagement() {
  const [channels, setChannels] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 20, totalPages: 0 });
  const navigate = useNavigate();

  // ✅ fetchChannels 함수를 useCallback으로 감싸줍니다.
  const fetchChannels = useCallback(async (page) => {
    try {
      const response = await axios.get(`http://localhost:8081/api/live-channels?page=${page}&size=${pageInfo.size}`);
      setChannels(response.data.content);
      setPageInfo(prev => ({
        ...prev,
        page: response.data.number,
        totalPages: response.data.totalPages,
      }));
    } catch (error) {
      alert("Live 채널 목록을 불러오는 데 실패했습니다.");
    }
  }, [pageInfo.size]);

  // ✅ useEffect의 의존성 배열에 fetchChannels를 추가합니다.
  useEffect(() => {
    fetchChannels(0);
  }, [fetchChannels]);

  const handlePrevPage = () => {
    if (pageInfo.page > 0) {
      fetchChannels(pageInfo.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pageInfo.page < pageInfo.totalPages - 1) {
      fetchChannels(pageInfo.page + 1);
    }
  };

  const handleDelete = async (channelId) => {
    if (window.confirm(`정말로 이 채널(ID: ${channelId})을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:8081/api/live-channels/${channelId}`);
        alert('채널이 삭제되었습니다.');
        fetchChannels(pageInfo.page); // 현재 페이지 다시 로드
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>Live 채널 관리</h1>
      <button onClick={() => navigate('/dashboard/live/new')} style={{ marginBottom: '20px' }}>
        새 채널 추가
      </button>
      <table className="user-table">
        <thead>
          <tr>
            <th>순서</th>
            <th>채널명</th>
            <th>채널 제목</th>
            <th>소스 정보</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {channels.map(channel => (
            <tr key={channel.id}>
              <td>{channel.displayOrder}</td>
              <td>{channel.channelName}</td>
              <td>{channel.channelTitle}</td>
              <td>{channel.streamUrl}</td>
              <td>
                <button onClick={() => navigate(`/dashboard/live/edit/${channel.id}`)}>수정</button>
                <button onClick={() => handleDelete(channel.id)} style={{ marginLeft: '5px' }}>삭제</button>
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
          {pageInfo.page + 1} / {pageInfo.totalPages}
        </span>
        <button onClick={handleNextPage} disabled={pageInfo.page >= pageInfo.totalPages - 1}>
          다음 &gt;
        </button>
      </div>
    </div>
  );
}

export default LiveManagement;
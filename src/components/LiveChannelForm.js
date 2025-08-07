import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function LiveChannelForm() {
  const { id } = useParams(); // URL에 id가 있으면 '수정', 없으면 '추가' 모드
  const navigate = useNavigate();
  const [channel, setChannel] = useState({
    displayOrder: '',
    channelName: '',
    channelTitle: '',
    streamUrl: ''
  });

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      // 수정 모드일 때만 기존 채널 정보를 불러옵니다.
      const fetchChannel = async () => {
        try {
          const response = await axios.get(`http://localhost:8081/api/live-channels/${id}`);
          setChannel(response.data);
        } catch (error) {
          alert('채널 정보를 불러오는 데 실패했습니다.');
        }
      };
      fetchChannel();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChannel(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // 수정 모드: PUT 요청
        await axios.put(`http://localhost:8081/api/live-channels/${id}`, channel);
        alert('채널이 성공적으로 수정되었습니다.');
      } else {
        // 추가 모드: POST 요청
        await axios.post('http://localhost:8081/api/live-channels', channel);
        alert('채널이 성공적으로 추가되었습니다.');
      }
      navigate('/dashboard/live');
    } catch (error) {
      alert('작업에 실패했습니다.');
    }
  };

  return (
    <div>
      <h1>{isEditMode ? 'Live 채널 수정' : '새 Live 채널 추가'}</h1>
      <form onSubmit={handleSubmit}>
        <table className="user-table">
          <tbody>
            <tr>
              <th>채널 순서</th>
              <td><input type="number" name="displayOrder" value={channel.displayOrder} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <th>채널명</th>
              <td><input type="text" name="channelName" value={channel.channelName} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <th>채널 제목</th>
              <td><input type="text" name="channelTitle" value={channel.channelTitle} onChange={handleChange} /></td>
            </tr>
            <tr>
              <th>스트림 URL</th>
              <td><input type="text" name="streamUrl" value={channel.streamUrl} onChange={handleChange} required /></td>
            </tr>
          </tbody>
        </table>
        <br />
        <button type="submit">{isEditMode ? '수정하기' : '추가하기'}</button>
        <button type="button" onClick={() => navigate('/dashboard/live')}>취소</button>
      </form>
    </div>
  );
}

export default LiveChannelForm;
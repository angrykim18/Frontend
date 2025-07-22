import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ServerForm() {
  const { id } = useParams(); // URL에 id가 있으면 '수정', 없으면 '추가' 모드
  const navigate = useNavigate();
  const [server, setServer] = useState({
    serverName: '',
    serverUrl: '',
    description: ''
  });
  const isEditMode = Boolean(id);

  useEffect(() => {
    // ✅ [수정] 수정 모드일 때, 기존 서버 정보를 불러오는 기능을 완성합니다.
    if (isEditMode) {
      const fetchServer = async () => {
        try {
          const response = await axios.get(`http://localhost:8081/api/servers/${id}`);
          setServer(response.data);
        } catch (error) {
          alert('서버 정보를 불러오는 데 실패했습니다.');
        }
      };
      fetchServer();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiEndpoint = isEditMode ? `http://localhost:8081/api/servers/${id}` : 'http://localhost:8081/api/servers';
    const apiMethod = isEditMode ? 'put' : 'post';

    try {
      await axios[apiMethod](apiEndpoint, server);
      alert(`서버가 성공적으로 ${isEditMode ? '수정' : '추가'}되었습니다.`);
      navigate('/dashboard/servers');
    } catch (error) {
      alert('작업에 실패했습니다.');
    }
  };

  return (
    <div>
      <h1>{isEditMode ? '서버 수정' : '새 서버 추가'}</h1>
      <form onSubmit={handleSubmit}>
        <table className="user-table">
          <tbody>
            <tr>
              <th>서버 이름</th>
              <td><input type="text" name="serverName" value={server.serverName} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <th>서버 주소 (URL)</th>
              <td><input type="text" name="serverUrl" value={server.serverUrl} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <th>설명</th>
              <td><textarea name="description" rows="5" value={server.description} onChange={handleChange}></textarea></td>
            </tr>
          </tbody>
        </table>
        <br />
        <button type="submit">{isEditMode ? '수정하기' : '추가하기'}</button>
        <button type="button" onClick={() => navigate('/dashboard/servers')}>취소</button>
      </form>
    </div>
  );
}

export default ServerForm;
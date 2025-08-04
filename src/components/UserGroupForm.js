import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css'; 

function UserGroupForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState({
    groupName: '',
    description: '',
    liveServerId: '',
    vodServerId: '',
    replayServerId: ''
  });
  const [servers, setServers] = useState([]);
  const isEditMode = Boolean(id);

  // 서버 목록을 불러옵니다.
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/servers');
        setServers(response.data);
      } catch (error) {
        alert('서버 목록을 불러오는 데 실패했습니다.');
      }
    };
    fetchServers();
  }, []);

  // 수정 모드일 때, 기존 그룹 정보를 불러옵니다.
  useEffect(() => {
    if (isEditMode) {
      const fetchGroup = async () => {
        try {
          const response = await axios.get(`http://localhost:8081/api/user-groups/${id}`);
          setGroup(response.data);
        } catch (error) {
          alert('그룹 정보를 불러오는 데 실패했습니다.');
        }
      };
      fetchGroup();
    }
  }, [id, isEditMode]);

  // 입력 필드의 내용이 바뀔 때마다 group 상태를 업데이트합니다.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroup(prev => ({ ...prev, [name]: value }));
  };

  // '저장하기' 또는 '수정하기' 버튼을 눌렀을 때 실행되는 기능
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSend = {
        ...group,
        liveServerId: group.liveServerId ? Number(group.liveServerId) : null,
        vodServerId: group.vodServerId ? Number(group.vodServerId) : null,
        replayServerId: group.replayServerId ? Number(group.replayServerId) : null,
    };

    const apiEndpoint = isEditMode ? `http://localhost:8081/api/user-groups/${id}` : 'http://localhost:8081/api/user-groups';
    const apiMethod = isEditMode ? 'put' : 'post';

    try {
      await axios[apiMethod](apiEndpoint, dataToSend);
      alert(`그룹이 성공적으로 ${isEditMode ? '수정' : '추가'}되었습니다.`);
      navigate('/dashboard/groups');
    } catch (error) {
      alert('작업에 실패했습니다. 그룹 이름이 중복될 수 있습니다.');
    }
  };

  return (
    <div>
      <h1>{isEditMode ? '셋탑 그룹 수정' : '새 셋탑 그룹 추가'}</h1>
      <form onSubmit={handleSubmit}>
        <table className="user-table">
          <tbody>
            <tr>
              <th>그룹 이름</th>
              <td><input type="text" name="groupName" value={group.groupName || ''} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <th>설명</th>
              <td><textarea name="description" rows="3" value={group.description || ''} onChange={handleChange}></textarea></td>
            </tr>
            {/* ✅ 사라졌던 서버 매핑 기능을 다시 추가합니다. */}
            <tr>
              <th>Live 서버 매핑</th>
              <td>
                <select name="liveServerId" value={group.liveServerId || ''} onChange={handleChange}>
                  <option value="">서버 선택 안함</option>
                  {servers.map(server => <option key={server.id} value={server.id}>{server.serverName}</option>)}
                </select>
              </td>
            </tr>
            <tr>
              <th>VOD 서버 매핑</th>
              <td>
                <select name="vodServerId" value={group.vodServerId || ''} onChange={handleChange}>
                  <option value="">서버 선택 안함</option>
                  {servers.map(server => <option key={server.id} value={server.id}>{server.serverName}</option>)}
                </select>
              </td>
            </tr>
            <tr>
              <th>다시보기 서버 매핑</th>
              <td>
                <select name="replayServerId" value={group.replayServerId || ''} onChange={handleChange}>
                  <option value="">서버 선택 안함</option>
                  {servers.map(server => <option key={server.id} value={server.id}>{server.serverName}</option>)}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <button type="submit">{isEditMode ? '수정하기' : '추가하기'}</button>
        <button type="button" onClick={() => navigate('/dashboard/groups')}>취소</button>
      </form>
    </div>
  );
}

export default UserGroupForm;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function UserGroupManagement() {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/user-groups');
      setGroups(response.data);
    } catch (error) {
      alert("그룹 목록을 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (groupId) => {
    if (window.confirm(`정말로 이 그룹(ID: ${groupId})을 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:8081/api/user-groups/${groupId}`);
        alert('그룹이 삭제되었습니다.');
        fetchGroups();
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>셋탑 그룹 관리</h1>
      <button onClick={() => navigate('/dashboard/group/new')} style={{ marginBottom: '20px' }}>
        새 그룹 추가
      </button>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>그룹 이름</th>
            <th>설명</th>
            <th>Live 서버 ID</th>
            <th>VOD 서버 ID</th>
            <th>다시보기 서버 ID</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr key={group.id}>
              <td>{group.id}</td>
              <td>{group.groupName}</td>
              <td>{group.description}</td>
              <td>{group.liveServerId}</td>
              <td>{group.vodServerId}</td>
              <td>{group.replayServerId}</td>
              <td>
                <button onClick={() => navigate(`/dashboard/group/edit/${group.id}`)}>수정</button>
                <button onClick={() => handleDelete(group.id)} style={{ marginLeft: '5px' }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserGroupManagement;
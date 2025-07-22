import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function AgencyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  // ✅ [수정] agency 객체 하나로 모든 정보를 관리합니다.
  const [agency, setAgency] = useState({
    agencyName: '',
    loginId: '',
    password: '',
    dateCredits: 0
  });
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const isEditMode = Boolean(id);

  // ✅ [핵심 버그 수정]
  // 수정 모드일 때, '대리점 정보'와 '대리점이 관리하는 그룹 목록'을 모두 불러와서
  // 각각의 상태에 올바르게 저장합니다.
  useEffect(() => {
    // 전체 그룹 목록은 항상 불러옵니다.
    const fetchAllGroups = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/user-groups');
        setAllGroups(response.data);
      } catch (error) {
        alert('전체 그룹 목록을 불러오는 데 실패했습니다.');
      }
    };
    fetchAllGroups();

    // 수정 모드일 때만 특정 대리점의 데이터를 불러옵니다.
    if (isEditMode) {
      const fetchAgencyData = async () => {
        try {
          // Promise.all을 사용하여 두 개의 API를 동시에 호출합니다.
          const [agencyRes, managedGroupsRes] = await Promise.all([
            axios.get(`http://localhost:8081/api/agencies/${id}`),
            axios.get(`http://localhost:8081/api/agencies/${id}/groups`)
          ]);
          
          // 대리점 정보를 상태에 저장합니다. (비밀번호 포함)
          setAgency(agencyRes.data);
          // 이 대리점이 관리하는 그룹 ID 목록을 상태에 저장합니다.
          setSelectedGroupIds(managedGroupsRes.data);

        } catch (error) {
          alert('대리점 데이터를 불러오는 데 실패했습니다.');
        }
      };
      fetchAgencyData();
    }
  }, [id, isEditMode]);

  const handleGroupCheckboxChange = (groupId) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgency(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const agencyData = { 
        ...agency,
        groupIds: selectedGroupIds 
    };

    const apiEndpoint = isEditMode ? `http://localhost:8081/api/agencies/${id}` : 'http://localhost:8081/api/agencies';
    const apiMethod = isEditMode ? 'put' : 'post';
    
    try {
      await axios[apiMethod](apiEndpoint, agencyData);
      alert(`대리점이 성공적으로 ${isEditMode ? '수정' : '추가'}되었습니다.`);
      navigate('/dashboard/agencies');
    } catch (error) {
      alert('작업에 실패했습니다.');
    }
  };
  
  return (
    <div>
      <h1>{isEditMode ? '대리점 수정' : '새 대리점 추가'}</h1>
      <form onSubmit={handleSubmit}>
        <table className="user-table">
          <tbody>
            <tr>
              <th>대리점 이름</th>
              <td><input type="text" name="agencyName" value={agency.agencyName} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <th>로그인 ID</th>
              <td><input type="text" name="loginId" value={agency.loginId} onChange={handleChange} required disabled={isEditMode} /></td>
            </tr>
            <tr>
              <th>비밀번호</th>
              {/* ✅ [수정] 비밀번호를 그대로 보여주고, 수정할 수 있도록 변경했습니다. */}
              <td><input type="text" name="password" value={agency.password} onChange={handleChange} required /></td>
            </tr>
            <tr>
              <th>보유 크레딧</th>
              <td><input type="number" name="dateCredits" value={agency.dateCredits} onChange={handleChange} /> 일</td>
            </tr>
            <tr>
              <th>관리할 그룹 선택</th>
              <td>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {allGroups.map(group => (
                    <label key={group.id} style={{ marginRight: '15px', display: 'block' }}>
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.includes(group.id)}
                        onChange={() => handleGroupCheckboxChange(group.id)}
                      />
                      {group.groupName}
                    </label>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <button type="submit">{isEditMode ? '수정하기' : '추가하기'}</button>
        <button type="button" onClick={() => navigate('/dashboard/agencies')}>취소</button>
      </form>
    </div>
  );
}

export default AgencyForm;
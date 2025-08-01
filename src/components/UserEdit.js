import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/user-groups');
        setGroups(response.data);
      } catch (error) {
        alert('그룹 목록을 불러오는 데 실패했습니다.');
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/users/${id}`);
        const userData = response.data;
        if (userData.subscriptionEndDate) {
          userData.subscriptionEndDate = userData.subscriptionEndDate.split('T')[0];
        }
        setUser(userData);
      } catch (error) {
        alert("사용자 정보를 불러오는 데 실패했습니다.");
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // ✅ 사용하지 않는 checked 변수를 제거하여 경고를 해결합니다.
    const newValue = type === 'radio' ? (value === 'true') : (type === 'checkbox' ? e.target.checked : value);
    setUser(prevUser => ({
      ...prevUser,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8081/api/users/${id}`, user);
      alert('사용자 정보가 성공적으로 수정되었습니다.');
      navigate('/dashboard/users');
    } catch (error) {
      alert("정보 수정에 실패했습니다.");
    }
  };

  if (!user) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <h1>사용자 정보 수정 (ID: {id})</h1>
      <form onSubmit={handleSubmit}>
        <table className="user-table">
            <tbody>
                <tr>
                    <th>이름</th>
                    <td><input type="text" name="name" value={user.name || ''} onChange={handleChange} /></td>
                </tr>
                <tr>
                    <th>그룹</th>
                    <td>
                        <select name="userGroup" value={user.userGroup || ''} onChange={handleChange}>
                            <option value="">그룹 선택 없음</option>
                            {groups.map(group => (
                                <option key={group.id} value={group.groupName}>
                                    {group.groupName}
                                </option>
                            ))}
                        </select>
                    </td>
                </tr>
                <tr>
                    <th>상태</th>
                    <td>
                        <select name="status" value={user.status} onChange={handleChange}>
                            <option value="사용중">사용중</option>
                            <option value="승인대기">승인대기</option>
                            <option value="정지">정지</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th>종료일자</th>
                    <td><input type="date" name="subscriptionEndDate" value={user.subscriptionEndDate || ''} onChange={handleChange} /></td>
                </tr>
                <tr>
                    <th>성인인증</th>
                    <td>
                        <label><input type="radio" name="adultContentAllowed" value="true" checked={user.adultContentAllowed === true} onChange={handleChange} /> 허용</label>
                        <label style={{ marginLeft: '10px' }}><input type="radio" name="adultContentAllowed" value="false" checked={user.adultContentAllowed === false} onChange={handleChange} /> 비허용</label>
                    </td>
                </tr>
                <tr>
                    <th>메모</th>
                    <td><textarea name="memo" rows="8" value={user.memo || ''} onChange={handleChange}></textarea></td>
                </tr>
            </tbody>
        </table>
        <br />
        <button type="submit">저장하기</button>
        <button type="button" onClick={() => navigate('/dashboard/users')}>취소</button>
      </form>
    </div>
  );
}

export default UserEdit;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdForm() {
  const { id } = useParams(); // URL에 id가 있으면 '수정' 모드
  const navigate = useNavigate();
  const [adName, setAdName] = useState('');
  const [targetGroup, setTargetGroup] = useState('전체');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      // 수정 모드일 때, 기존 광고 정보를 불러와 폼에 채웁니다.
      const fetchAd = async () => {
        try {
          const response = await axios.get(`http://localhost:8081/api/ads/${id}`);
          const { adName, targetGroup, active } = response.data;
          setAdName(adName);
          setTargetGroup(targetGroup);
          setIsActive(active);
        } catch (error) {
          alert('광고 정보를 불러오는 데 실패했습니다.');
        }
      };
      fetchAd();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode) {
      // 수정 모드 (텍스트 정보만 수정)
      try {
        await axios.put(`http://localhost:8081/api/ads/${id}`, {
          adName,
          targetGroup,
          active: isActive
        });
        alert('광고 정보가 수정되었습니다.');
        navigate('/dashboard/ads');
      } catch (error) {
        alert('광고 수정에 실패했습니다.');
      }
    } else {
      // 추가 모드 (이미지 파일 포함)
      if (!imageFile) {
        alert('이미지 파일을 선택해주세요.');
        return;
      }
      const formData = new FormData();
      formData.append('adName', adName);
      formData.append('targetGroup', targetGroup);
      formData.append('imageFile', imageFile);

      try {
        await axios.post('http://localhost:8081/api/ads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('광고가 성공적으로 추가되었습니다.');
        navigate('/dashboard/ads');
      } catch (error) {
        alert('광고 추가에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>{isEditMode ? `광고 수정 (ID: ${id})` : '새 광고 추가'}</h1>
      <form onSubmit={handleSubmit}>
        <table className="user-table">
          <tbody>
            <tr>
              <th>광고 이름</th>
              <td><input type="text" value={adName} onChange={(e) => setAdName(e.target.value)} required /></td>
            </tr>
            <tr>
              <th>타겟 그룹</th>
              <td>
                <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)}>
                  <option value="전체">전체</option>
                  <option value="VIP">VIP</option>
                  <option value="일반">일반</option>
                </select>
              </td>
            </tr>
            {isEditMode ? (
              <tr>
                <th>상태</th>
                <td>
                  <label><input type="radio" checked={isActive === true} onChange={() => setIsActive(true)} /> 활성</label>
                  <label style={{ marginLeft: '10px' }}><input type="radio" checked={isActive === false} onChange={() => setIsActive(false)} /> 비활성</label>
                </td>
              </tr>
            ) : (
              <tr>
                <th>이미지 파일</th>
                <td><input type="file" onChange={(e) => setImageFile(e.target.files[0])} required /></td>
              </tr>
            )}
          </tbody>
        </table>
        <br />
        <button type="submit">{isEditMode ? '수정하기' : '추가하기'}</button>
        <button type="button" onClick={() => navigate('/dashboard/ads')}>취소</button>
      </form>
    </div>
  );
}

export default AdForm;
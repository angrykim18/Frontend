import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function NoticeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [targetGroup, setTargetGroup] = useState('전체');
  const [isActive, setIsActive] = useState(true);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      const fetchNotice = async () => {
        try {
          const response = await axios.get(`http://localhost:8081/api/notices/${id}`);
          const { content, targetGroup, active } = response.data;
          setContent(content);
          setTargetGroup(targetGroup);
          setIsActive(active);
        } catch (error) {
          alert('공지사항 정보를 불러오는 데 실패했습니다.');
        }
      };
      fetchNotice();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const noticeData = { content, targetGroup, active: isActive };
    const apiEndpoint = isEditMode ? `http://localhost:8081/api/notices/${id}` : 'http://localhost:8081/api/notices';
    const apiMethod = isEditMode ? 'put' : 'post';

    try {
      await axios[apiMethod](apiEndpoint, noticeData);
      alert(`공지사항이 성공적으로 ${isEditMode ? '수정' : '작성'}되었습니다.`);
      navigate('/dashboard/notices');
    } catch (error) {
      alert('작업에 실패했습니다.');
    }
  };

  return (
    <div>
      <h1>{isEditMode ? '공지사항 수정' : '새 공지사항 작성'}</h1>
      <form onSubmit={handleSubmit}>
        <table className="user-table">
          <tbody>
            <tr>
              <th>내용</th>
              <td><textarea value={content} onChange={(e) => setContent(e.target.value)} required rows="15" style={{width: '98%'}}></textarea></td>
            </tr>
            <tr>
              <th>타겟 그룹 (콤마로 구분)</th>
              <td><input type="text" value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} required style={{width: '98%'}} /></td>
            </tr>
            <tr>
              <th>상태</th>
              <td><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> 활성</td>
            </tr>
          </tbody>
        </table>
        <br />
        <button type="submit">{isEditMode ? '수정하기' : '작성하기'}</button>
        <button type="button" onClick={() => navigate('/dashboard/notices')}>취소</button>
      </form>
    </div>
  );
}

export default NoticeForm;
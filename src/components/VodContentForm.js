import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Form.css';

function VodContentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId: initialCategoryId } = location.state || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [exposed, setExposed] = useState(true);
  // ✅ [수정] 텍스트 경로 대신, 선택된 파일 객체를 저장하도록 변경
  const [posterFile, setPosterFile] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/vod-categories');
        setAllCategories(response.data);
      } catch (error) {
        alert('전체 카테고리 목록을 불러오는 데 실패했습니다.');
      }
    };
    fetchAllCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      alert('카테고리를 선택하세요.');
      return;
    }

    // ✅ [수정] 파일과 텍스트를 함께 보내기 위해 FormData 객체를 사용합니다.
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('exposed', exposed);
    formData.append('categoryId', selectedCategoryId);
    if (posterFile) {
      formData.append('poster', posterFile);
    }

    try {
      // ✅ [수정] FormData를 전송할 때는 multipart/form-data 헤더를 사용합니다.
      await axios.post('http://localhost:8081/api/vod-contents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('콘텐츠가 성공적으로 등록되었습니다.');
      navigate('/dashboard/vod');
    } catch (error) {
      alert('콘텐츠 등록에 실패했습니다.');
    }
  };

  return (
    <div className="form-container">
      <h1>새 VOD 콘텐츠 등록</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>콘텐츠 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>카테고리</label>
          <select
            value={selectedCategoryId || ''}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            required
          >
            <option value="" disabled>카테고리를 선택하세요</option>
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>소개 (메모)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>포스터 이미지</label>
          {/* ✅ [수정] 텍스트 입력 대신, 파일 선택 버튼으로 변경 */}
          <input
            type="file"
            onChange={(e) => setPosterFile(e.target.files[0])}
          />
        </div>
        <div className="form-group">
          <label>노출 상태</label>
          <select
            value={exposed}
            onChange={(e) => setExposed(e.target.value === 'true')}
          >
            <option value={true}>노출</option>
            <option value={false}>노출 안함</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit">저장하기</button>
          <button type="button" onClick={() => navigate('/dashboard/vod')}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default VodContentForm;
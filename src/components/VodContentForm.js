import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './Form.css';

function VodContentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { categoryId: initialCategoryId } = location.state || {};
  
  const isEditMode = id !== undefined;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [exposed, setExposed] = useState(true);
  const [posterFile, setPosterFile] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vod-categories`);
        setAllCategories(response.data);
      } catch (error) {
        alert('전체 카테고리 목록을 불러오는 데 실패했습니다.');
      }
    };

    const fetchContentData = async () => {
      if (isEditMode) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vod-contents/${id}`);
          const data = response.data;
          setTitle(data.title);
          setDescription(data.description);
          setExposed(data.exposed);
          setSelectedCategoryId(data.categoryId);
        } catch (error) {
          alert('콘텐츠 정보를 불러오는 데 실패했습니다.');
        }
      }
    };
    
    fetchAllCategories();
    fetchContentData();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      alert('카테고리를 선택하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('exposed', exposed);
    formData.append('categoryId', selectedCategoryId);
    if (posterFile) {
      formData.append('poster', posterFile);
    }

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (isEditMode) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/vod-contents/${id}`, formData, config);
        alert('콘텐츠가 성공적으로 수정되었습니다.');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/vod-contents`, formData, config);
        alert('콘텐츠가 성공적으로 등록되었습니다.');
      }
      navigate('/dashboard/vod');
    } catch (error) {
      alert(`콘텐츠 ${isEditMode ? '수정' : '등록'}에 실패했습니다.`);
    }
  };

  return (
    <div className="form-container">
      <h1>{isEditMode ? 'VOD 콘텐츠 수정' : '새 VOD 콘텐츠 등록'}</h1>
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
          <button type="submit">{isEditMode ? '수정하기' : '저장하기'}</button>
          <button type="button" onClick={() => navigate('/dashboard/vod')}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default VodContentForm;
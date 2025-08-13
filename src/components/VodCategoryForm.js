import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Form.css';

function VodCategoryForm() {
  const { id } = useParams(); // URL에서 수정할 카테고리의 ID를 가져옵니다.
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [parentId, setParentId] = useState('');
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    // 모든 카테고리 목록을 불러와서 부모 선택 드롭다운에 사용합니다.
    const fetchAllCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vod-categories`);
        // 자기 자신을 부모로 선택하지 않도록 현재 수정 중인 카테고리는 목록에서 제외합니다.
        setAllCategories(response.data.filter(cat => cat.id !== Number(id)));
      } catch (error) {
        alert('전체 카테고리 목록을 불러오는 데 실패했습니다.');
      }
    };

    // 수정할 카테고리의 현재 정보를 불러옵니다.
    const fetchCategoryDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vod-categories/${id}`);
        setCategoryName(response.data.categoryName);
        setParentId(response.data.parentId || ''); // parentId가 null이면 빈 문자열로 설정
      } catch (error) {
        alert('카테고리 정보를 불러오는 데 실패했습니다.');
        navigate('/dashboard/vod');
      }
    };

    fetchAllCategories();
    if (id) {
      fetchCategoryDetails();
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const categoryData = {
      categoryName,
      // parentId가 빈 문자열이면 null로 변환하여 전송 (최상위 카테고리)
      parentId: parentId ? Number(parentId) : null,
    };

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/vod-categories/${id}`, categoryData);
      alert('카테고리가 성공적으로 수정되었습니다.');
      navigate('/dashboard/vod');
    } catch (error) {
      alert('카테고리 수정에 실패했습니다.');
    }
  };

  return (
    <div className="form-container">
      <h1>VOD 카테고리 수정</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>카테고리 이름</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>부모 카테고리</label>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">-- 없음 (최상위 카테고리) --</option>
            {allCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit">저장하기</button>
          <button type="button" onClick={() => navigate('/dashboard/vod')}>취소</button>
        </div>
      </form>
    </div>
  );
}

export default VodCategoryForm;
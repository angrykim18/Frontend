import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function AdManagement() {
  const [ads, setAds] = useState([]);
  const navigate = useNavigate();

  const fetchAds = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/ads');
      setAds(response.data);
    } catch (error) {
      alert("광고 목록을 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async (adId) => {
    if (window.confirm(`정말로 이 광고(ID: ${adId})를 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:8081/api/ads/${adId}`);
        alert('광고가 삭제되었습니다.');
        fetchAds();
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>광고 관리</h1>
      <button onClick={() => navigate('/dashboard/ad/new')} style={{ marginBottom: '20px' }}>
        새 광고 추가
      </button>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>광고 이름</th>
            <th>타겟 그룹</th>
            <th>이미지 경로</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {ads.map(ad => (
            <tr key={ad.id}>
              <td>{ad.id}</td>
              <td>{ad.adName}</td>
              <td>{ad.targetGroup}</td>
              <td>{ad.imagePath}</td>
              <td>{ad.active ? '활성' : '비활성'}</td>
              <td>
                {/* ✅ 수정 버튼 활성화 및 네비게이션 기능 추가 */}
                <button onClick={() => navigate(`/dashboard/ad/edit/${ad.id}`)}>수정</button>
                <button onClick={() => handleDelete(ad.id)} style={{ marginLeft: '5px' }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdManagement;
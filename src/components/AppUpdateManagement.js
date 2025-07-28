import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css'; // 기존 CSS 재사용

function AppUpdateManagement() {
  const [versions, setVersions] = useState([]);
  const navigate = useNavigate();

  const fetchVersions = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/updates');
      const sortedVersions = response.data.sort((a, b) => b.versionCode - a.versionCode);
      setVersions(sortedVersions);
    } catch (error) {
      alert("앱 버전 목록을 불러오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  // ✅ [기능 추가] 삭제 버튼 클릭 시 실행될 함수
  const handleDelete = async (versionId, versionName) => {
    if (window.confirm(`정말로 버전 '${versionName}' (ID: ${versionId})을(를) 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:8081/api/updates/${versionId}`);
        alert('버전이 삭제되었습니다.');
        fetchVersions(); // 목록 새로고침
      } catch (error) {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>앱 업데이트 관리</h1>
      <button onClick={() => navigate('/dashboard/update/new')} style={{ marginBottom: '20px' }}>
        새 버전 앱 업로드
      </button>
      <table className="user-table">
        <thead>
          <tr>
            <th>버전 코드</th>
            <th>버전 이름</th>
            <th>릴리즈 노트</th>
            <th>파일 경로</th>
            <th>업로드 일시</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {versions.map(version => (
            <tr key={version.id}>
              <td>{version.versionCode}</td>
              <td>{version.versionName}</td>
              <td style={{ maxWidth: '400px', whiteSpace: 'pre-wrap' }}>{version.releaseNotes}</td>
              <td>{version.filePath}</td>
              <td>{new Date(version.uploadedAt).toLocaleString('ko-KR')}</td>
              <td>
                {/* ✅ 삭제 버튼 추가 */}
                <button onClick={() => handleDelete(version.id, version.versionName)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AppUpdateManagement;
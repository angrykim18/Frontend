import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AppUpdateForm() {
  const navigate = useNavigate();
  const [versionCode, setVersionCode] = useState('');
  const [versionName, setVersionName] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [appFile, setAppFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appFile) {
      alert('.apk 파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('versionCode', versionCode);
    formData.append('versionName', versionName);
    formData.append('releaseNotes', releaseNotes);
    formData.append('appFile', appFile);

    try {
      await axios.post('http://localhost:8081/api/updates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('새 버전이 성공적으로 업로드되었습니다.');
      navigate('/dashboard/updates');
    } catch (error) {
      alert('업로드에 실패했습니다. 버전 코드가 중복되지 않았는지 확인해주세요.');
    }
  };

  return (
    <div>
      <h1>새 버전 앱 업로드</h1>
      <form onSubmit={handleSubmit}>
        <table className="user-table">
          <tbody>
            <tr>
              <th>버전 코드 (숫자만)</th>
              <td><input type="number" value={versionCode} onChange={(e) => setVersionCode(e.target.value)} required /></td>
            </tr>
            <tr>
              <th>버전 이름 (예: 1.0.1)</th>
              <td><input type="text" value={versionName} onChange={(e) => setVersionName(e.target.value)} required /></td>
            </tr>
            <tr>
              <th>릴리즈 노트 (업데이트 내용)</th>
              <td><textarea value={releaseNotes} onChange={(e) => setReleaseNotes(e.target.value)} rows="8" style={{width: '98%'}}></textarea></td>
            </tr>
            <tr>
              <th>앱 파일 (.apk)</th>
              <td><input type="file" accept=".apk" onChange={(e) => setAppFile(e.target.files[0])} required /></td>
            </tr>
          </tbody>
        </table>
        <br />
        <button type="submit">업로드하기</button>
        <button type="button" onClick={() => navigate('/dashboard/updates')}>취소</button>
      </form>
    </div>
  );
}

export default AppUpdateForm;
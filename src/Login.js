import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function Login() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!adminId || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      await axios.post('http://localhost:8081/api/auth/login', {
        adminId: adminId,
        password: password
      });
      navigate('/dashboard/users');
    } catch (error) {
      if (error.response) {
        alert(error.response.data);
      } else {
        alert('서버에 연결할 수 없습니다.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>관리자 로그인</h1>
        <div className="input-group">
          <label>아이디</label>
          <input 
            type="text" 
            placeholder="아이디를 입력하세요"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)} 
          />
        </div>
        <div className="input-group">
          <label>비밀번호</label>
          <input 
            type="password" 
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="login-button" onClick={handleLogin}>
          로그인
        </button>
      </div>
    </div>
  );
}

export default Login;
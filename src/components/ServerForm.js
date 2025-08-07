import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ServerForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [server, setServer] = useState({
        serverName: '',
        serverUrl: '',
        // ✅ [삭제] 더 이상 사용하지 않는 description 필드를 state에서 제거합니다.
    });
    const isEditMode = Boolean(id);

    useEffect(() => {
        if (isEditMode) {
            const fetchServer = async () => {
                try {
                    const response = await axios.get(`http://localhost:8081/api/servers/${id}`);
                    setServer(response.data);
                } catch (error) {
                    alert('서버 정보를 불러오는 데 실패했습니다.');
                }
            };
            fetchServer();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setServer(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiEndpoint = isEditMode ? `http://localhost:8081/api/servers/${id}` : 'http://localhost:8081/api/servers';
        const apiMethod = isEditMode ? 'put' : 'post';

        try {
            // ✅ [수정] description 필드를 전송하지 않도록 수정된 server 객체를 그대로 사용합니다.
            await axios[apiMethod](apiEndpoint, server);
            alert(`서버가 성공적으로 ${isEditMode ? '수정' : '추가'}되었습니다.`);
            navigate('/dashboard/servers');
        } catch (error) {
            alert('작업에 실패했습니다.');
        }
    };

    return (
        <div>
            <h1>{isEditMode ? '서버 수정' : '새 서버 추가'}</h1>
            <form onSubmit={handleSubmit}>
                <table className="user-table">
                    <tbody>
                        <tr>
                            <th>서버 이름</th>
                            <td><input type="text" name="serverName" value={server.serverName} onChange={handleChange} required style={{width: '98%'}} /></td>
                        </tr>
                        <tr>
                            <th>서버 주소 (URL)</th>
                            {/* ✅ [수정] 너비를 98%로 늘려서 긴 주소를 보기 편하게 만듭니다. */}
                            <td><input type="text" name="serverUrl" value={server.serverUrl} onChange={handleChange} required style={{width: '98%'}} /></td>
                        </tr>
                        {/* ✅ [삭제] '설명' 행(tr) 전체를 삭제합니다. */}
                    </tbody>
                </table>
                <br />
                <button type="submit">{isEditMode ? '수정하기' : '추가하기'}</button>
                <button type="button" onClick={() => navigate('/dashboard/servers')}>취소</button>
            </form>
        </div>
    );
}

export default ServerForm;
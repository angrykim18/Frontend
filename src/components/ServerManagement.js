import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function ServerManagement() {
    const [servers, setServers] = useState([]);
    const navigate = useNavigate();

    const fetchServers = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/servers');
            setServers(response.data);
        } catch (error) {
            alert("서버 목록을 불러오는 데 실패했습니다.");
        }
    };

    useEffect(() => {
        fetchServers();
    }, []);

    const handleDelete = async (serverId) => {
        if (window.confirm(`정말로 이 서버(ID: ${serverId})를 삭제하시겠습니까?`)) {
            try {
                await axios.delete(`http://localhost:8081/api/servers/${serverId}`);
                alert('서버가 삭제되었습니다.');
                fetchServers();
            } catch (error) {
                alert('삭제에 실패했습니다.');
            }
        }
    };

    return (
        <div>
            <h1>서버 관리</h1>
            <button onClick={() => navigate('/dashboard/server/new')} style={{ marginBottom: '20px' }}>
                새 서버 추가
            </button>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>서버 이름</th>
                        <th>서버 주소 (URL)</th>
                        {/* ✅ [삭제] '설명' 헤더를 삭제합니다. */}
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {servers.map(server => (
                        <tr key={server.id}>
                            <td>{server.id}</td>
                            <td>{server.serverName}</td>
                            {/* ✅ [수정] 너비를 넓게 사용하도록 스타일 추가 */}
                            <td style={{ maxWidth: '600px', wordBreak: 'break-all' }}>{server.serverUrl}</td>
                            {/* ✅ [삭제] '설명' 데이터를 표시하는 부분을 삭제합니다. */}
                            <td>
                                <button onClick={() => navigate(`/dashboard/server/edit/${server.id}`)}>수정</button>
                                <button onClick={() => handleDelete(server.id)} style={{ marginLeft: '5px' }}>삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ServerManagement;
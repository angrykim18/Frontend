import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function LiveManagement() {
    const [channels, setChannels] = useState([]);
    // ✅ [수정] 페이지 상태를 더 명확하게 관리하도록 변경합니다.
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10; // ✅ [수정] 페이지 크기를 10으로 고정합니다.
    const navigate = useNavigate();

    // ✅ [수정] useEffect는 currentPage가 바뀔 때마다 채널 목록을 다시 불러옵니다.
    // 이것이 더 안정적이고 표준적인 방식입니다.
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/live-channels?page=${currentPage}&size=${pageSize}`);
                setChannels(response.data.content);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                alert("Live 채널 목록을 불러오는 데 실패했습니다.");
            }
        };

        fetchChannels();
    }, [currentPage]); // currentPage가 변경될 때마다 이 코드가 다시 실행됩니다.

    const handlePrevPage = () => {
        // ✅ [수정] 단순히 현재 페이지 번호를 감소시킵니다.
        setCurrentPage(prevPage => prevPage - 1);
    };

    const handleNextPage = () => {
        // ✅ [수정] 단순히 현재 페이지 번호를 증가시킵니다.
        setCurrentPage(prevPage => prevPage + 1);
    };

    const handleDelete = async (channelId) => {
        if (window.confirm(`정말로 이 채널(ID: ${channelId})을 삭제하시겠습니까?`)) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/live-channels/${channelId}`);
                alert('채널이 삭제되었습니다.');
                // ✅ [수정] 삭제 후에는 첫 페이지로 이동하여 목록을 갱신합니다.
                setCurrentPage(0);
            } catch (error) {
                alert('삭제에 실패했습니다.');
            }
        }
    };

    return (
        <div>
            <h1>Live 채널 관리</h1>
            <button onClick={() => navigate('/dashboard/live/new')} style={{ marginBottom: '20px' }}>
                새 채널 추가
            </button>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>순서</th>
                        <th>채널명</th>
                        <th>채널 제목</th>
                        <th>소스 정보</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {channels.map(channel => (
                        <tr key={channel.id}>
                            <td>{channel.displayOrder}</td>
                            <td>{channel.channelName}</td>
                            <td>{channel.channelTitle}</td>
                            <td>{channel.streamUrl}</td>
                            <td>
                                <button onClick={() => navigate(`/dashboard/live/edit/${channel.id}`)}>수정</button>
                                <button onClick={() => handleDelete(channel.id)} style={{ marginLeft: '5px' }}>삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                {/* ✅ [수정] disabled 로직을 새로운 state에 맞게 변경 */}
                <button onClick={handlePrevPage} disabled={currentPage === 0}>
                    &lt; 이전
                </button>
                <span>
                    {currentPage + 1} / {totalPages}
                </span>
                <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
                    다음 &gt;
                </button>
            </div>
        </div>
    );
}

export default LiveManagement;
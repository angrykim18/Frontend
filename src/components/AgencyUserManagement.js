import React, { useState, useEffect } from 'react'; // ✅ useCallback 삭제
import axios from 'axios';
import './UserManagement.css';

function AgencyUserManagement() {
    const [users, setUsers] = useState([]);
    // ✅ [수정] 페이지 상태를 더 명확하게 관리하도록 변경합니다.
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 50;
    const agencyInfo = JSON.parse(sessionStorage.getItem('agency'));

    // ✅ [수정] useEffect는 currentPage가 바뀔 때마다 사용자 목록을 다시 불러옵니다.
    useEffect(() => {
        if (!agencyInfo) {
            alert("대리점 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:8081/api/users?agencyId=${agencyInfo.id}&page=${currentPage}&size=${pageSize}`);
                setUsers(response.data.content);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                alert("사용자 목록을 불러오는 데 실패했습니다.");
            }
        };

        fetchUsers();
    }, [currentPage, agencyInfo]); // currentPage가 변경될 때마다 이 코드가 다시 실행됩니다.

    const handlePrevPage = () => {
        setCurrentPage(prevPage => prevPage - 1);
    };

    const handleNextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    return (
        <div>
            <h1>대리점 사용자 관리</h1>
            <p>'{agencyInfo?.agencyName}' 소속의 사용자 목록입니다.</p>
            
            <table className="user-table">
                <thead>
                    <tr>
                        <th>관리 ID</th>
                        <th>이름</th>
                        <th>그룹</th>
                        <th>상태</th>
                        <th>종료일자</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.managementId}</td>
                            <td>{user.name}</td>
                            <td>{user.userGroup}</td>
                            <td>{user.status}</td>
                            <td>{user.subscriptionEndDate}</td>
                            <td>
                                <button>날짜 충전</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {/* ✅ [수정] disabled 로직을 새로운 state에 맞게 변경 */}
                <button onClick={handlePrevPage} disabled={currentPage === 0}>&lt; 이전</button>
                <span>{currentPage + 1} / {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>다음 &gt;</button>
            </div>
        </div>
    );
}

export default AgencyUserManagement;
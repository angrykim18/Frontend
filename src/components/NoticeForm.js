import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function NoticeForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // ✅ [수정] 백엔드 JSON 필드명인 'active'로 통일합니다.
    const [noticeData, setNoticeData] = useState({
        noticeType: '일반',
        content: '',
        targetGroup: '',
        active: true // 기본값
    });
    const [userGroups, setUserGroups] = useState([]);

    const isEditMode = Boolean(id);

    useEffect(() => {
        const fetchUserGroups = async () => {
            try {
                const response = await axios.get('http://localhost:8081/api/user-groups');
                setUserGroups(response.data);
                if (!isEditMode && response.data.length > 0) {
                    setNoticeData(prev => ({ ...prev, targetGroup: response.data[0].groupName }));
                }
            } catch (error) {
                alert('셋탑 그룹 목록을 불러오는 데 실패했습니다.');
            }
        };
        fetchUserGroups();

        if (isEditMode) {
            const fetchNotice = async () => {
                try {
                    const response = await axios.get(`http://localhost:8081/api/notices/${id}`);
                    setNoticeData(response.data);
                } catch (error) {
                    alert('공지사항 정보를 불러오는 데 실패했습니다.');
                }
            };
            fetchNotice();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNoticeData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiEndpoint = isEditMode ? `http://localhost:8081/api/notices/${id}` : 'http://localhost:8081/api/notices';
        const apiMethod = isEditMode ? 'put' : 'post';

        try {
            await axios[apiMethod](apiEndpoint, noticeData);
            alert(`공지사항이 성공적으로 ${isEditMode ? '수정' : '작성'}되었습니다.`);
            navigate('/dashboard/notices');
        } catch (error) {
            alert('작업에 실패했습니다.');
        }
    };

    return (
        <div>
            <h1>{isEditMode ? '공지사항 수정' : '새 공지사항 작성'}</h1>
            <form onSubmit={handleSubmit}>
                <table className="user-table">
                    <tbody>
                        <tr>
                            <th>공지 타입</th>
                            <td>
                                <label><input type="radio" name="noticeType" value="일반" checked={noticeData.noticeType === '일반'} onChange={handleChange} /> 일반 공지</label>
                                <label style={{ marginLeft: '15px' }}><input type="radio" name="noticeType" value="긴급" checked={noticeData.noticeType === '긴급'} onChange={handleChange} /> 긴급 공지 (팝업)</label>
                            </td>
                        </tr>
                        <tr>
                            <th>내용</th>
                            <td><textarea name="content" value={noticeData.content} onChange={handleChange} required rows="15" style={{width: '98%'}}></textarea></td>
                        </tr>
                        <tr>
                            <th>타겟 그룹</th>
                            <td>
                                <select name="targetGroup" value={noticeData.targetGroup} onChange={handleChange}>
                                    <option value="전체">전체</option>
                                    {userGroups.map(group => (
                                        <option key={group.id} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>상태</th>
                            {/* ✅ [수정] noticeData.isActive를 noticeData.active로 변경합니다. */}
                            <td><input type="checkbox" name="active" checked={noticeData.active} onChange={handleChange} /> 활성</td>
                        </tr>
                    </tbody>
                </table>
                <br />
                <button type="submit">{isEditMode ? '수정하기' : '작성하기'}</button>
                <button type="button" onClick={() => navigate('/dashboard/notices')}>취소</button>
            </form>
        </div>
    );
}

export default NoticeForm;
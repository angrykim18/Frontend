import React, { useState, useEffect } from 'react'; // ✅ [수정] 따옴표를 중괄호로 수정
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserManagement.css';

function AdForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [adData, setAdData] = useState({
        adName: '',
        targetGroup: '',
        active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [userGroups, setUserGroups] = useState([]);

    const isEditMode = Boolean(id);

    useEffect(() => {
        const fetchUserGroups = async () => {
            try {
                const response = await axios.get('http://localhost:8081/api/user-groups');
                setUserGroups(response.data);
                if (!isEditMode && response.data.length > 0) {
                    setAdData(prev => ({ ...prev, targetGroup: response.data[0].groupName }));
                }
            } catch (error) {
                alert('셋탑 그룹 목록을 불러오는 데 실패했습니다.');
            }
        };
        fetchUserGroups();

        if (isEditMode) {
            const fetchAd = async () => {
                try {
                    const response = await axios.get(`http://localhost:8081/api/ads/${id}`);
                    setAdData(response.data);
                } catch (error) {
                    alert('광고 정보를 불러오는 데 실패했습니다.');
                }
            };
            fetchAd();
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAdData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('adName', adData.adName);
        formData.append('targetGroup', adData.targetGroup);
        formData.append('active', adData.active);
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        try {
            if (isEditMode) {
                await axios.put(`http://localhost:8081/api/ads/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('광고가 성공적으로 수정되었습니다.');
            } else {
                if (!imageFile) {
                    alert('이미지 파일을 선택해주세요.');
                    return;
                }
                await axios.post('http://localhost:8081/api/ads', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('광고가 성공적으로 추가되었습니다.');
            }
            navigate('/dashboard/ads');
        } catch (error) {
            alert('작업에 실패했습니다.');
        }
    };

    return (
        <div>
            <h1>{isEditMode ? `광고 수정 (ID: ${id})` : '새 광고 추가'}</h1>
            <form onSubmit={handleSubmit}>
                <table className="user-table">
                    <tbody>
                        <tr>
                            <th>광고 이름</th>
                            <td><input type="text" name="adName" value={adData.adName} onChange={handleChange} required /></td>
                        </tr>
                        <tr>
                            <th>타겟 그룹</th>
                            <td>
                                <select name="targetGroup" value={adData.targetGroup} onChange={handleChange}>
                                    <option value="">그룹 선택</option>
                                    {userGroups.map(group => (
                                        <option key={group.id} value={group.groupName}>
                                            {group.groupName}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                        {isEditMode && (
                            <tr>
                                <th>상태</th>
                                <td>
                                    <label><input type="radio" name="active" checked={adData.active === true} onChange={() => setAdData(prev => ({...prev, active: true}))} /> 활성</label>
                                    <label style={{ marginLeft: '10px' }}><input type="radio" name="active" checked={adData.active === false} onChange={() => setAdData(prev => ({...prev, active: false}))} /> 비활성</label>
                                </td>
                            </tr>
                        )}
                        <tr>
                            <th>이미지 파일 {isEditMode && '(변경 시에만 선택)'}</th>
                            <td><input type="file" onChange={(e) => setImageFile(e.target.files[0])} required={!isEditMode} /></td>
                        </tr>
                    </tbody>
                </table>
                <br />
                <button type="submit">{isEditMode ? '수정하기' : '추가하기'}</button>
                <button type="button" onClick={() => navigate('/dashboard/ads')}>취소</button>
            </form>
        </div>
    );
}

export default AdForm;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './VodFileManagementModal.css';

const INITIAL_FORM_STATE = { vodFileName: '', vodFilePath: '' };

function VodFileManagementModal({ content, onClose, onDataChange }) {
    const [files, setFiles] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 1, totalElements: 0 });
    const pageSize = 25;
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [editingFile, setEditingFile] = useState(null);
    const isEditMode = editingFile !== null;
    const [isFullEditMode, setIsFullEditMode] = useState(false);

    const fetchFiles = useCallback(async (page) => {
        if (!content) return;
        try {
            const response = await axios.get(`http://localhost:8081/api/vod-files`, {
                params: { contentId: content.id, page: page, size: pageSize }
            });

            const { content: pagedContent, number, totalPages, totalElements } = response.data;
            const pagedFiles = pagedContent.map((file, index) => ({
                ...file,
                displayOrder: totalElements - (number * pageSize) - index
            }));

            setFiles(pagedFiles);
            setPageInfo({ page: number, totalPages: totalPages, totalElements: totalElements });
        } catch (error) { console.error('파일 목록 로딩 실패.', error); alert('파일 목록 로딩 실패.'); }
    }, [content]);

    const fetchAllFiles = useCallback(async () => {
        if (!content) return;
        try {
            const response = await axios.get(`http://localhost:8081/api/vod-files/all`, {
                params: { contentId: content.id }
            });
            const fetchedFiles = response.data;
            const totalItems = fetchedFiles.length;
            const renumberedFiles = fetchedFiles
                .sort((a, b) => (b.fileOrder || 0) - (a.fileOrder || 0)) // 역순 정렬
                .map((file, index) => ({ ...file, fileOrder: file.fileOrder || totalItems - index })); // 기존 순서 유지, 없으면 역순 부여
            setFiles(renumberedFiles);
        } catch (error) { console.error('전체 파일 목록 로딩 실패.', error); alert('전체 파일 목록 로딩 실패.'); }
    }, [content]);

    useEffect(() => {
        if (content) { setIsFullEditMode(false); fetchFiles(0); }
    }, [content, fetchFiles]);

    // ✅ [최종 수정] 사용자가 입력한 값을 그대로 상태에 반영하는 단순한 함수로 변경
    const handleOrderChange = (targetFileId, newOrderValue) => {
        setFiles(currentFiles =>
            currentFiles.map(file =>
                file.id === targetFileId
                    // 입력값이 비어있으면 빈 문자열로, 아니면 숫자로 변환하여 저장
                    ? { ...file, fileOrder: newOrderValue === '' ? '' : parseInt(newOrderValue, 10) }
                    : file
            )
        );
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        setFiles(currentFiles => {
            const items = Array.from(currentFiles);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);
            const totalItems = items.length;
            return items.map((file, index) => ({ ...file, fileOrder: totalItems - index }));
        });
    };

    const handleSaveOrder = async () => {
        // ✅ [최종 수정] 저장 시점에 중복된 순서가 있는지 검사
        const orderSet = new Set();
        const filesPayload = files.map(file => {
            const order = parseInt(file.fileOrder, 10);
            if (isNaN(order)) {
                // 순서가 비어있거나 숫자가 아닌 경우에 대한 처리
                throw new Error(`파일(ID: ${file.id})의 순서가 유효하지 않습니다.`);
            }
            if (orderSet.has(order)) {
                // 중복된 순서가 있는 경우에 대한 처리
                throw new Error(`순서 번호 ${order}가 중복되었습니다. 확인 후 다시 시도해주세요.`);
            }
            orderSet.add(order);
            return { id: file.id, order: order };
        });

        try {
            await axios.patch('http://localhost:8081/api/vod-files/reorder', { contentId: content.id, files: filesPayload });
            alert('파일 순서가 저장되었습니다.');
            onDataChange();
            if (isFullEditMode) { fetchAllFiles(); } else { fetchFiles(pageInfo.page); }
        } catch (error) {
            // 위에서 throw한 에러 또는 서버 에러를 여기서 잡아서 사용자에게 알림
            alert(error.message || '순서 저장에 실패했습니다.');
            console.error('순서 저장 실패.', error);
        }
    };
    
    const handlePrevPage = () => { if (pageInfo.page > 0) fetchFiles(pageInfo.page - 1); };
    const handleNextPage = () => { if (pageInfo.page < pageInfo.totalPages - 1) fetchFiles(pageInfo.page + 1); };
    const handleEnterFullEditMode = () => { if (window.confirm('전체 파일의 순서를 편집하시겠습니까? 파일이 많을 경우 로딩에 시간이 걸릴 수 있습니다.')) { setIsFullEditMode(true); fetchAllFiles(); }};
    const handleExitFullEditMode = () => { setIsFullEditMode(false); fetchFiles(0); };
    const handleEditClick = (file) => { setEditingFile(file); setFormData({ vodFileName: file.vodFileName || '', vodFilePath: file.vodFilePath || '' }); };
    const handleCancelEdit = () => { setEditingFile(null); setFormData(INITIAL_FORM_STATE); };
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = async (e) => { e.preventDefault(); const requestData = { ...formData }; const url = isEditMode ? `http://localhost:8081/api/vod-files/${editingFile.id}` : `http://localhost:8081/api/vod-files`; if (!isEditMode) { requestData.vodContentId = content.id; } const method = isEditMode ? 'put' : 'post'; try { await axios[method](url, requestData); alert(`파일이 성공적으로 ${isEditMode ? '수정' : '추가'}되었습니다.`); handleCancelEdit(); onDataChange(); if (isFullEditMode) { fetchAllFiles(); } else { fetchFiles(0); } } catch (error) { console.error(`파일 ${isEditMode ? '수정' : '추가'} 실패.`, error); alert(`파일 ${isEditMode ? '수정' : '추가'} 실패.`); } };
    const handleDelete = async (fileId) => { if (window.confirm(`정말로 이 파일(ID: ${fileId})을 삭제하시겠습니까?`)) { try { await axios.delete(`http://localhost:8081/api/vod-files/${fileId}`); alert('파일이 삭제되었습니다.'); onDataChange(); if (isFullEditMode) { fetchAllFiles(); } else { if (files.length === 1 && pageInfo.page > 0) { fetchFiles(pageInfo.page - 1); } else { fetchFiles(pageInfo.page); } } } catch (error) { console.error('삭제 실패.', error); alert('삭제 실패.'); } } };
    if (!content) return null;
    
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{content.title} - 파일 관리 {isFullEditMode && "(전체 순서 편집 모드)"}</h2>
                <div className="file-list">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable-files">
                            {(provided) => (
                                <table className="user-table" {...provided.droppableProps} ref={provided.innerRef}>
                                    <thead>
                                        <tr><th>순서</th><th>VOD 파일 이름</th><th>VOD 파일 경로</th><th>관리</th></tr>
                                    </thead>
                                    <tbody>
                                        {files.map((file, index) => (
                                            <Draggable key={file.id} draggableId={String(file.id)} index={index} isDragDisabled={!isFullEditMode}>
                                                {(provided) => (
                                                    <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                        <td style={{ width: '60px', textAlign: 'center' }}>
                                                            {isFullEditMode ? (
                                                                // ✅ [최종 수정] 입력 값을 바로 상태에 반영하는 Input
                                                                <input
                                                                    type="number"
                                                                    value={file.fileOrder || ''}
                                                                    onChange={(e) => handleOrderChange(file.id, e.target.value)}
                                                                    style={{ width: '60px', textAlign: 'center', backgroundColor: '#1e1e1e', color: 'white', border: '1px solid #555' }}
                                                                />
                                                            ) : (
                                                                file.displayOrder
                                                            )}
                                                        </td>
                                                        <td title={file.vodFileName}>{file.vodFileName}</td>
                                                        <td title={file.vodFilePath}>{file.vodFilePath}</td>
                                                        <td>
                                                            <button onClick={() => handleEditClick(file)}>수정</button>
                                                            <button onClick={() => handleDelete(file.id)} className="delete-btn" style={{marginLeft: '5px'}}>삭제</button>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </tbody>
                                </table>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                {!isFullEditMode && (
                    <div className="pagination" style={{textAlign: 'center', margin: '15px 0'}}>
                        <button onClick={handlePrevPage} disabled={pageInfo.page === 0}>&lt; 이전</button>
                        <span style={{ margin: '0 15px' }}>{pageInfo.page + 1} / {pageInfo.totalPages || 1}</span>
                        <button onClick={handleNextPage} disabled={pageInfo.page >= pageInfo.totalPages - 1}>다음 &gt;</button>
                    </div>
                )}
                <div className="file-upload-section">
                    <h3>{isEditMode ? `파일 수정 (ID: ${editingFile.id})` : '새 파일 등록'}</h3>
                    <form onSubmit={handleSubmit} className="upload-form">
                        <input type="text" name="vodFileName" placeholder="VOD 파일 이름" value={formData.vodFileName} onChange={handleChange} required />
                        <input type="text" name="vodFilePath" placeholder="VOD 파일 경로" value={formData.vodFilePath} onChange={handleChange} required />
                        <button type="submit">{isEditMode ? '수정 완료' : '등록'}</button>
                        {isEditMode && <button type="button" onClick={handleCancelEdit} style={{marginLeft: '5px'}}>취소</button>}
                    </form>
                </div>
                <div className="modal-actions">
                    {isFullEditMode ? (<button onClick={handleExitFullEditMode} style={{backgroundColor: '#ffc107', color: 'black'}}>페이지 모드로 보기</button>) : (<button onClick={handleEnterFullEditMode}>전체 순서 편집</button>)}
                    <button onClick={handleSaveOrder} className="save-order-btn">순서 저장</button>
                    <button onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
}

export default VodFileManagementModal;
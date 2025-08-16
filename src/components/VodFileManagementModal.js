import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './VodFileManagementModal.css';

const INITIAL_FORM_STATE = { vodFileName: '', vodFilePath: '' };
const PAGE_SIZE = 25;

function VodFileManagementModal({ content, onClose, onDataChange }) {
    // Component State
    const [files, setFiles] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 1, totalElements: 0 });
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [editingFile, setEditingFile] = useState(null);
    const [isFullEditMode, setIsFullEditMode] = useState(false);

    const isEditMode = editingFile !== null;

    // Data Fetching & Management
    const fetchFiles = useCallback(async (page) => {
        if (!content) return;
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vod-files`, {
                params: { contentId: content.id, page: page, size: PAGE_SIZE }
            });
            const { content: pagedContent, number, totalPages, totalElements } = response.data;
            const pagedFiles = pagedContent.map((file, index) => ({
                ...file,
                displayOrder: totalElements - (number * PAGE_SIZE) - index
            }));
            setFiles(pagedFiles);
            setPageInfo({ page: number, totalPages, totalElements });
        } catch (error) {
            console.error('파일 목록 로딩 실패.', error);
            alert('파일 목록 로딩에 실패했습니다.');
        }
    }, [content]);

    const fetchAllFiles = useCallback(async () => {
        if (!content) return;
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/vod-files/all`, {
                params: { contentId: content.id }
            });
            const fetchedFiles = response.data;
            const totalItems = fetchedFiles.length;
            const renumberedFiles = fetchedFiles
                .sort((a, b) => (b.fileOrder || 0) - (a.fileOrder || 0)) // 역순 정렬
                .map((file, index) => ({ ...file, fileOrder: file.fileOrder || totalItems - index })); // 기존 순서 유지, 없으면 역순 부여
            setFiles(renumberedFiles);
        } catch (error) {
            console.error('전체 파일 목록 로딩 실패.', error);
            alert('전체 파일 목록 로딩에 실패했습니다.');
        }
    }, [content]);

    useEffect(() => {
        if (content) {
            setIsFullEditMode(false);
            fetchFiles(0);
        }
    }, [content, fetchFiles]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Event Handlers
    const handleOrderChange = (targetFileId, newOrderValue) => {
        setFiles(currentFiles =>
            currentFiles.map(file =>
                file.id === targetFileId
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
        try {
            const orderSet = new Set();
            const filesPayload = files.map(file => {
                const order = parseInt(file.fileOrder, 10);
                if (isNaN(order)) {
                    throw new Error(`파일(ID: ${file.id})의 순서가 유효하지 않습니다.`);
                }
                if (orderSet.has(order)) {
                    throw new Error(`순서 번호 ${order}가 중복되었습니다. 확인 후 다시 시도해주세요.`);
                }
                orderSet.add(order);
                return { id: file.id, order: order };
            });

            await axios.patch(`${process.env.REACT_APP_API_URL}/api/vod-files/reorder`, { contentId: content.id, files: filesPayload });
            alert('파일 순서가 저장되었습니다.');
            onDataChange();
            if (isFullEditMode) {
                fetchAllFiles();
            } else {
                fetchFiles(pageInfo.page);
            }
        } catch (error) {
            alert(error.message || '순서 저장에 실패했습니다.');
            console.error('순서 저장 실패.', error);
        }
    };

    const handlePrevPage = () => {
        if (pageInfo.page > 0) {
            fetchFiles(pageInfo.page - 1);
        }
    };

    const handleNextPage = () => {
        if (pageInfo.page < pageInfo.totalPages - 1) {
            fetchFiles(pageInfo.page + 1);
        }
    };

    const handleEnterFullEditMode = () => {
        const confirmationMessage = '전체 파일의 순서를 편집하시겠습니까?\n파일이 많을 경우 로딩에 시간이 걸릴 수 있습니다.';
        if (window.confirm(confirmationMessage)) {
            setIsFullEditMode(true);
            fetchAllFiles();
        }
    };

    const handleExitFullEditMode = () => {
        setIsFullEditMode(false);
        fetchFiles(0);
    };

    const handleEditClick = (file) => {
        setEditingFile(file);
        setFormData({ vodFileName: file.vodFileName || '', vodFilePath: file.vodFilePath || '' });
    };

    const handleCancelEdit = () => {
        setEditingFile(null);
        setFormData(INITIAL_FORM_STATE);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requestData = { ...formData };

        if (!isEditMode) {
            requestData.vodContentId = content.id;
        }

        const url = isEditMode
            ? `${process.env.REACT_APP_API_URL}/api/vod-files/${editingFile.id}`
            : `${process.env.REACT_APP_API_URL}/api/vod-files`;
        const method = isEditMode ? 'put' : 'post';

        try {
            await axios[method](url, requestData);
            alert(`파일이 성공적으로 ${isEditMode ? '수정' : '추가'}되었습니다.`);
            handleCancelEdit();
            onDataChange();
            if (isFullEditMode) {
                fetchAllFiles();
            } else {
                fetchFiles(0);
            }
        } catch (error) {
            console.error(`파일 ${isEditMode ? '수정' : '추가'} 실패.`, error);
            alert(`파일 ${isEditMode ? '수정' : '추가'}에 실패했습니다.`);
        }
    };

    const handleDelete = async (fileId) => {
        if (window.confirm(`정말로 이 파일(ID: ${fileId})을 삭제하시겠습니까?`)) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/vod-files/${fileId}`);
                alert('파일이 삭제되었습니다.');
                onDataChange();
                if (isFullEditMode) {
                    fetchAllFiles();
                } else {
                    if (files.length === 1 && pageInfo.page > 0) {
                        fetchFiles(pageInfo.page - 1);
                    } else {
                        fetchFiles(pageInfo.page);
                    }
                }
            } catch (error) {
                console.error('삭제 실패.', error);
                alert('삭제에 실패했습니다.');
            }
        }
    };

    // Component Render
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
                                        <tr>
                                            <th>순서</th>
                                            <th>VOD 파일 이름</th>
                                            <th>VOD 파일 경로</th>
                                            <th>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {files.map((file, index) => (
                                            <Draggable key={file.id} draggableId={String(file.id)} index={index} isDragDisabled={!isFullEditMode}>
                                                {(provided) => (
                                                    <tr ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                        <td style={{ width: '60px', textAlign: 'center' }}>
                                                            {isFullEditMode ? (
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
                                                            <button onClick={() => handleDelete(file.id)} className="delete-btn" style={{ marginLeft: '5px' }}>삭제</button>
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
                    <div className="pagination" style={{ textAlign: 'center', margin: '15px 0' }}>
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
                        {isEditMode && <button type="button" onClick={handleCancelEdit} style={{ marginLeft: '5px' }}>취소</button>}
                    </form>
                </div>

                <div className="modal-actions">
                    {isFullEditMode
                        ? <button onClick={handleExitFullEditMode} style={{ backgroundColor: '#ffc107', color: 'black' }}>페이지 모드로 보기</button>
                        : <button onClick={handleEnterFullEditMode}>전체 순서 편집</button>
                    }
                    <button onClick={handleSaveOrder} className="save-order-btn">순서 저장</button>
                    <button onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
}

export default VodFileManagementModal;
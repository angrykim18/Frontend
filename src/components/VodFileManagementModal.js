import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FixedSizeList as List } from 'react-window'; // ✅ [추가] react-window import
import './VodFileManagementModal.css';

function VodFileManagementModal({ content, onClose }) {
    const [files, setFiles] = useState([]);
    const [newFileNumber, setNewFileNumber] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchFiles = useCallback(async () => {
        if (!content) return;
        try {
            const response = await axios.get(`http://localhost:8081/api/vod-files`, {
                params: { contentId: content.id }
            });
            setFiles(response.data);
        } catch (error) {
            alert('파일 목록을 불러오는 데 실패했습니다.');
        }
    }, [content]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleUpload = async () => {
        if (!newFileNumber || !newFileName || !selectedFile) {
            alert('모든 필드를 입력하고 파일을 선택해주세요.');
            return;
        }
        const formData = new FormData();
        formData.append('vodContentId', content.id);
        formData.append('vodFileNumber', newFileNumber);
        formData.append('vodFileName', newFileName);
        formData.append('file', selectedFile);
        try {
            await axios.post('http://localhost:8081/api/vod-files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('파일이 성공적으로 등록되었습니다.');
            setNewFileNumber('');
            setNewFileName('');
            setSelectedFile(null);
            document.getElementById('file-input').value = null;
            fetchFiles();
        } catch (error) {
            alert('파일 등록에 실패했습니다.');
        }
    };

    const handleDelete = async (fileId) => {
        if (window.confirm("정말 이 파일을 삭제하시겠습니까?")) {
            try {
                await axios.delete(`http://localhost:8081/api/vod-files/${fileId}`);
                alert('파일이 삭제되었습니다.');
                fetchFiles();
            } catch (error) {
                alert('파일 삭제에 실패했습니다.');
            }
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(files);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFiles(items);
    };

    const handleSaveOrder = async () => {
        const payload = files.map((file, index) => ({
            id: file.id,
            order: index + 1,
        }));
        try {
            await axios.patch('http://localhost:8081/api/vod-files/reorder', payload);
            alert('파일 순서가 저장되었습니다.');
            fetchFiles();
        } catch (error) {
            alert('순서 저장에 실패했습니다.');
        }
    };

    if (!content) return null;

    // ✅ [추가] react-window가 각 행을 렌더링하기 위한 컴포넌트
    const Row = ({ index, style }) => {
        const file = files[index];
        return (
            <Draggable draggableId={file.id.toString()} index={index} key={file.id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{ ...provided.draggableProps.style, ...style }}
                        className={`file-row ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                        <div className="file-cell" style={{ width: '8%' }}>{index + 1}</div>
                        <div className="file-cell" style={{ width: '32%' }}>{file.vodFileName}</div>
                        <div className="file-cell" style={{ width: '30%' }}>{file.vodFilePath}</div>
                        <div className="file-cell" style={{ width: '20%' }}>{new Date(file.createdAt).toLocaleString('ko-KR')}</div>
                        <div className="file-cell" style={{ width: '10%' }}>
                            <button onClick={() => handleDelete(file.id)}>삭제</button>
                        </div>
                    </div>
                )}
            </Draggable>
        );
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{content.title} - 파일 관리</h2>
                <div className="file-list">
                    {/* ✅ [수정] 테이블 헤더는 가상화 영역 밖에 별도로 생성 */}
                    <div className="file-list-header">
                        <div className="file-cell" style={{ width: '8%' }}>순서</div>
                        <div className="file-cell" style={{ width: '32%' }}>앱 노출용 이름</div>
                        <div className="file-cell" style={{ width: '30%' }}>실제 파일 이름</div>
                        <div className="file-cell" style={{ width: '20%' }}>등록일</div>
                        <div className="file-cell" style={{ width: '10%' }}>관리</div>
                    </div>
                    {/* ✅ [수정] DragDropContext와 react-window의 FixedSizeList를 연동 */}
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable
                            droppableId="droppable"
                            mode="virtual"
                            renderClone={(provided, snapshot, rubric) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{ ...provided.draggableProps.style }}
                                    className={`file-row ${snapshot.isDragging ? 'dragging' : ''}`}
                                >
                                    {files[rubric.source.index].vodFileName}
                                </div>
                            )}
                        >
                            {(provided) => (
                                <List
                                    height={400} // 리스트의 높이를 지정
                                    itemCount={files.length}
                                    itemSize={45} // 각 행의 높이
                                    outerRef={provided.innerRef}
                                    width="100%"
                                >
                                    {Row}
                                </List>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                <div className="file-upload-section">
                    <h3>새 파일 등록</h3>
                    <div className="upload-form">
                        <input type="text" placeholder="앱 노출용 이름 (예: 마우스 1회)" value={newFileNumber} onChange={(e) => setNewFileNumber(e.target.value)} />
                        <input type="text" placeholder="실제 파일 이름 (예: mouse_e01.mp4)" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
                        <input id="file-input" type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                        <button onClick={handleUpload}>등록</button>
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={handleSaveOrder} className="save-order-btn">순서 저장</button>
                    <button onClick={onClose}>닫기</button>
                </div>
            </div>
        </div>
    );
}

export default VodFileManagementModal;
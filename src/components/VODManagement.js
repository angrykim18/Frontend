import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VodManagement.css';
import VodFileManagementModal from './VodFileManagementModal';
import CategorySelectionModal from './CategorySelectionModal';

function VODManagement() {
    const [categoryTree, setCategoryTree] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [vodContent, setVodContent] = useState([]);
    const [selectedContentIds, setSelectedContentIds] = useState(new Set());
    const [modalContent, setModalContent] = useState(null);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSearch, setCurrentSearch] = useState('');
    const [topOrderEdit, setTopOrderEdit] = useState([]);
    const [childOrderEdit, setChildOrderEdit] = useState([]);
    const navigate = useNavigate();

    const fetchVodContent = useCallback(async (category, page, search='') => {
        if (!category) return;
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/vod-contents`, {
                params: { categoryId: category.id, page, size: 12, title: search }
            });
            setVodContent(res.data.content);
            setTotalPages(res.data.totalPages);
            setCurrentPage(res.data.number);
        } catch (e) {
            alert(`${category.name || category.categoryName} 콘텐츠 목록 로딩 실패`);
            setVodContent([]);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/vod-categories/tree`, { params: { mode: 'web' } });
            const tree = res.data || [];
            setCategoryTree(tree);

            // ✅ (1) 최상위만 순서 편집 목록에 넣기
            const rootsOnly = tree.filter(n => n.parentId == null);
            setTopOrderEdit(rootsOnly.map((n, idx) => ({
                id: n.id,
                name: n.name || n.categoryName,
                order: (n.displayOrder && Number.isInteger(n.displayOrder)) ? n.displayOrder : idx + 1
            })));

            // 마지막 선택 복원
            const lastId = parseInt(localStorage.getItem('lastSelectedCategoryId') || '0', 10);
            if (lastId) {
                const found = tree.find(t => t.id === lastId);
                if (found) {
                    setSelectedCategory(found);
                    setChildOrderEdit((found.children || []).map((c, idx) => ({
                        id: c.id,
                        name: c.name || c.categoryName,
                        order: (c.displayOrder && Number.isInteger(c.displayOrder)) ? c.displayOrder : idx + 1
                    })));
                    fetchVodContent(found, 0, '');
                } else {
                    setSelectedCategory(null);
                    setChildOrderEdit([]);
                }
            } else {
                setSelectedCategory(null);
                setChildOrderEdit([]);
            }
        } catch (e) {
            alert('VOD 카테고리(웹용) 로딩 실패');
            setCategoryTree([]); setTopOrderEdit([]); setChildOrderEdit([]);
        }
    }, [fetchVodContent]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const setOrderValue = (setter, index, value) => {
        const v = value === '' ? '' : parseInt(value, 10);
        setter(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], order: Number.isInteger(v) ? v : '' };
            return copy;
        });
    };

    const normalizeOrders = (arr) => {
        const filled = arr.filter(x => Number.isInteger(x.order)).sort((a,b)=>a.order-b.order);
        const reassigned = filled.map((x,i)=>({ ...x, order: i+1 }));
        const missing = arr.filter(x => !Number.isInteger(x.order)).map((x,i)=>({ ...x, order: reassigned.length + i + 1 }));
        return [...reassigned, ...missing];
    };

    const saveTopOrder = async () => {
        try {
            const payload = {
                parentId: null,
                items: normalizeOrders(topOrderEdit).map(x=>({ id:x.id, displayOrder:x.order }))
            };
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/vod-categories/reorder`, payload);
            alert('최상위 카테고리 순서를 저장했습니다.');
            fetchCategories();
        } catch (e) {
            alert(e?.response?.data?.message || '최상위 순서 저장 실패');
        }
    };

    const saveChildOrder = async () => {
        if (!selectedCategory) { alert('좌측 트리에서 상위 카테고리를 선택하세요.'); return; }
        try {
            const payload = {
                parentId: selectedCategory.id,
                items: normalizeOrders(childOrderEdit).map(x=>({ id:x.id, displayOrder:x.order }))
            };
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/vod-categories/reorder`, payload);
            alert('하위 카테고리 순서를 저장했습니다.');
            fetchCategories();
        } catch (e) {
            alert(e?.response?.data?.message || '하위 순서 저장 실패');
        }
    };

    const refreshContentList = useCallback(() => {
        if (selectedCategory) fetchVodContent(selectedCategory, currentPage, currentSearch);
    }, [selectedCategory, currentPage, currentSearch, fetchVodContent]);

    const handleCategoryClick = (node) => {
        // ✅ 클릭 시, 최신 트리에서 해당 노드 다시 찾아 children 확보
        const fresh = categoryTree.find(n => n.id === node.id) || node;

        if (selectedCategory?.id === fresh.id) {
            setSelectedCategory(null);
            setVodContent([]); setTotalPages(0);
            setChildOrderEdit([]);
            localStorage.removeItem('lastSelectedCategoryId');
        } else {
            setSelectedCategory(fresh);
            fetchVodContent(fresh, 0, '');
            setSearchTerm(''); setCurrentSearch('');
            localStorage.setItem('lastSelectedCategoryId', fresh.id);
            const children = fresh.children || [];
            setChildOrderEdit(children.map((c, idx)=>({
                id: c.id,
                name: c.name || c.categoryName,
                order: (c.displayOrder && Number.isInteger(c.displayOrder)) ? c.displayOrder : idx + 1
            })));
        }
        setSelectedContentIds(new Set());
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 0 || pageNumber >= totalPages) return;
        fetchVodContent(selectedCategory, pageNumber, currentSearch);
    };

    const handleSearch = () => {
        setCurrentSearch(searchTerm);
        fetchVodContent(selectedCategory, 0, searchTerm);
    };

    const handleContentCheckboxChange = (id) => {
        setSelectedContentIds(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const handleSelectAllChange = (e) => {
        setSelectedContentIds(e.target.checked ? new Set(vodContent.map(c=>c.id)) : new Set());
    };

    const navigateToNewContentForm = () => {
        if (!selectedCategory) { alert("콘텐츠를 추가할 카테고리를 먼저 선택해주세요."); return; }
        navigate('/dashboard/vod/new', { state: { categoryId: selectedCategory.id } });
    };

    const handleEditContent = () => {
        if (selectedContentIds.size !== 1) { alert("수정할 콘텐츠를 하나만 선택하세요."); return; }
        const [idToEdit] = selectedContentIds;
        navigate(`/dashboard/vod/edit/${idToEdit}`);
    };

    const handleMoveContents = () => {
        if (selectedContentIds.size === 0) { alert("이동할 콘텐츠를 하나 이상 선택하세요."); return; }
        setIsMoveModalOpen(true);
    };

    const executeMove = async (targetCategoryId) => {
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/vod-contents/move`, { ids: Array.from(selectedContentIds), categoryId: targetCategoryId });
            alert("콘텐츠 이동이 완료되었습니다.");
            refreshContentList();
            setSelectedContentIds(new Set());
        } catch (e) {
            alert("콘텐츠 이동에 실패했습니다.");
        } finally {
            setIsMoveModalOpen(false);
        }
    };

    const handleDeleteContents = async () => {
        if (selectedContentIds.size === 0) { alert("삭제할 콘텐츠를 하나 이상 선택하세요."); return; }
        if (window.confirm(`${selectedContentIds.size}개의 콘텐츠를 정말 삭제하시겠습니까?`)) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/vod-contents`, { data: Array.from(selectedContentIds) });
                alert("선택한 콘텐츠가 삭제되었습니다.");
                fetchVodContent(selectedCategory, 0, '');
            } catch (e) {
                alert("콘텐츠 삭제에 실패했습니다.");
            }
        }
    };

    const renderCategoryTree = (nodes) => (
        <ul>
            {nodes.map(node => (
                <li key={node.id}>
                    <span
                        onClick={() => handleCategoryClick(node)}
                        className={selectedCategory?.id === node.id ? 'selected' : ''}>
                        {node.name || node.categoryName}
                    </span>
                    {node.children && node.children.length > 0 && renderCategoryTree(node.children)}
                </li>
            ))}
        </ul>
    );

    const renderPaginationButtons = () => {
        if (totalPages === 0) return null;
        const pageGroupSize = 10;
        const currentPageGroup = Math.floor(currentPage / pageGroupSize);
        const startPage = currentPageGroup * pageGroupSize;
        const endPage = Math.min(startPage + pageGroupSize - 1, totalPages - 1);
        const btns = [];
        btns.push(<button key="prev-group" onClick={() => handlePageChange(startPage - 1)} disabled={startPage === 0}>&lt;&lt;</button>);
        btns.push(<button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>&lt;</button>);
        for (let i = startPage; i <= endPage; i++) {
            btns.push(<button key={i} onClick={() => handlePageChange(i)} className={currentPage === i ? 'active' : ''}>{i + 1}</button>);
        }
        btns.push(<button key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>&gt;</button>);
        btns.push(<button key="next-group" onClick={() => handlePageChange(endPage + 1)} disabled={endPage >= totalPages - 1}>&gt;&gt;</button>);
        return btns;
    };

    const renderOrderEditors = () => (
        <div className="order-editors">
            <div className="order-section">
                <h3>최상위 카테고리 순서</h3>
                <table className="user-table no-zebra">{/* ✅ (2) 줄무늬 제거 클래스 */}
                    <thead><tr><th>이름</th><th style={{width:'120px'}}>순서</th></tr></thead>
                    <tbody>
                        {topOrderEdit.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.order}
                                        onChange={e=>setOrderValue(setTopOrderEdit, idx, e.target.value)}
                                        style={{width:'100px'}}
                                    />
                                </td>
                            </tr>
                        ))}
                        {topOrderEdit.length === 0 && (
                            <tr><td colSpan="2" style={{textAlign:'center'}}>최상위 카테고리가 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
                <button onClick={saveTopOrder}>최상위 순서 저장</button>
            </div>

            <div className="order-section" style={{marginTop:'20px'}}>
                <h3>{selectedCategory ? `'${selectedCategory.name || selectedCategory.categoryName}'의 하위 카테고리 순서` : '하위 카테고리 순서 (상위 선택 필요)'}</h3>
                <table className="user-table no-zebra">{/* ✅ (2) 줄무늬 제거 클래스 */}
                    <thead><tr><th>이름</th><th style={{width:'120px'}}>순서</th></tr></thead>
                    <tbody>
                        {childOrderEdit.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.order}
                                        onChange={e=>setOrderValue(setChildOrderEdit, idx, e.target.value)}
                                        style={{width:'100px'}}
                                    />
                                </td>
                            </tr>
                        ))}
                        {childOrderEdit.length === 0 && (
                            <tr><td colSpan="2" style={{textAlign:'center'}}>하위 카테고리가 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
                <button onClick={saveChildOrder} disabled={!selectedCategory}>하위 순서 저장</button>
            </div>
        </div>
    );

    return (
        <div className="vod-management-container">
            <div className="category-tree">
                <div className="tree-header"><h3>Category</h3></div>
                {renderCategoryTree(categoryTree)}
                <div style={{marginTop:'20px'}}>{renderOrderEditors()}</div>
            </div>

            <div className="content-panel">
                <div className="content-header">
                    <h2>{selectedCategory ? `${selectedCategory.name || selectedCategory.categoryName} 콘텐츠 목록` : '카테고리를 선택하세요'}</h2>
                    <div className="search-and-actions">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="제목으로 검색..."
                                value={searchTerm}
                                onChange={(e)=>setSearchTerm(e.target.value)}
                                onKeyDown={(e)=> e.key === 'Enter' && setTimeout(()=>handleSearch(),0)}
                            />
                            <button onClick={handleSearch}>검색</button>
                        </div>
                        <div className="content-actions">
                            <button onClick={navigateToNewContentForm}>새 콘텐츠</button>
                            <button onClick={handleEditContent}>수정</button>
                            <button onClick={handleMoveContents}>이동</button>
                            <button onClick={handleDeleteContents}>삭제</button>
                        </div>
                    </div>
                </div>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" onChange={handleSelectAllChange} /></th>
                            <th>ID</th>
                            <th>제목</th>
                            <th>포스터</th>
                            <th>노출</th>
                            <th>등록일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vodContent.map(content => (
                            <tr key={content.id} onDoubleClick={()=>setModalContent(content)}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedContentIds.has(content.id)}
                                        onChange={()=>handleContentCheckboxChange(content.id)}
                                    />
                                </td>
                                <td>{content.id}</td>
                                <td>{content.title}</td>
                                <td>{content.posterPath?.includes('_') ? content.posterPath.split('_').slice(1).join('_') : content.posterPath}</td>
                                <td>{content.exposed ? 'O' : 'X'}</td>
                                <td>{content.updatedAt ? new Date(content.updatedAt).toLocaleString('ko-KR') : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination">{renderPaginationButtons()}</div>
            </div>

            {modalContent && (
                <VodFileManagementModal
                    content={modalContent}
                    onClose={()=>setModalContent(null)}
                    onDataChange={refreshContentList}
                />
            )}
            <CategorySelectionModal
                isOpen={isMoveModalOpen}
                onClose={()=>setIsMoveModalOpen(false)}
                onConfirm={executeMove}
                categoryTree={categoryTree}
                currentCategoryId={selectedCategory?.id}
            />
        </div>
    );
}

export default VODManagement;

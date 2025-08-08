import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VodManagement.css';
import VodFileManagementModal from './VodFileManagementModal';
import CategorySelectionModal from './CategorySelectionModal';

function VODManagement() {
    // --- State Declarations ---
    const [categories, setCategories] = useState([]);
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
    const navigate = useNavigate();

    // --- Data Fetching ---
    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/vod-categories/all-for-web');
            return response.data;
        } catch (error) {
            alert("VOD 카테고리 목록을 불러오는 데 실패했습니다.");
            return [];
        }
    }, []);

    const fetchVodContent = useCallback(async (category, page, search = '') => {
        if (!category) return;
        try {
            const response = await axios.get(`http://localhost:8081/api/vod-contents`, {
                params: {
                    categoryId: category.id,
                    page: page,
                    size: 12,
                    title: search,
                },
            });
            setVodContent(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (error) {
            alert(`${category.name} 콘텐츠 목록을 불러오는 데 실패했습니다.`);
            setVodContent([]);
        }
    }, []);

    // --- useEffect Hooks ---
    useEffect(() => {
        const initialize = async () => {
            const fetchedCategories = await fetchCategories();
            setCategories(fetchedCategories);

            const lastCategoryId = localStorage.getItem('lastSelectedCategoryId');
            if (lastCategoryId) {
                const lastCategory = fetchedCategories.find(cat => cat.id === parseInt(lastCategoryId, 10));
                if (lastCategory) {
                    setSelectedCategory(lastCategory);
                    fetchVodContent(lastCategory, 0, '');
                }
            }
        };
        initialize();
    }, [fetchCategories, fetchVodContent]);

    useEffect(() => {
        const buildTree = (list, parentId = null) => {
            return list
                .filter(item => item.parentId === parentId)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map(item => ({ ...item, children: buildTree(list, item.id) }));
        };
        setCategoryTree(buildTree(categories));
    }, [categories]);

    // --- Event Handlers ---

    const refreshContentList = useCallback(() => {
        if (selectedCategory) {
            fetchVodContent(selectedCategory, currentPage, currentSearch);
        }
    }, [selectedCategory, currentPage, currentSearch, fetchVodContent]);

    const handleCategoryClick = (category) => {
        if (selectedCategory?.id === category.id) {
            setSelectedCategory(null);
            setVodContent([]);
            setTotalPages(0);
            localStorage.removeItem('lastSelectedCategoryId');
        } else {
            setSelectedCategory(category);
            fetchVodContent(category, 0, '');
            setSearchTerm('');
            setCurrentSearch('');
            localStorage.setItem('lastSelectedCategoryId', category.id);
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

    const handleContentCheckboxChange = (contentId) => {
        setSelectedContentIds(prev => {
            const newIds = new Set(prev);
            if (newIds.has(contentId)) newIds.delete(contentId);
            else newIds.add(contentId);
            return newIds;
        });
    };

    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            setSelectedContentIds(new Set(vodContent.map(c => c.id)));
        } else {
            setSelectedContentIds(new Set());
        }
    };

    const navigateToNewContentForm = () => {
        if (!selectedCategory) {
            alert("콘텐츠를 추가할 카테고리를 먼저 선택해주세요.");
            return;
        }
        navigate('/dashboard/vod/new', { state: { categoryId: selectedCategory.id } });
    };

    const handleEditContent = () => {
        if (selectedContentIds.size !== 1) {
            alert("수정할 콘텐츠를 하나만 선택하세요.");
            return;
        }
        const [idToEdit] = selectedContentIds;
        navigate(`/dashboard/vod/edit/${idToEdit}`);
    };
    
    const handleMoveContents = () => {
        if (selectedContentIds.size === 0) {
            alert("이동할 콘텐츠를 하나 이상 선택하세요.");
            return;
        }
        setIsMoveModalOpen(true);
    };

    const executeMove = async (targetCategoryId) => {
        try {
            await axios.patch('http://localhost:8081/api/vod-contents/move', {
                ids: Array.from(selectedContentIds),
                categoryId: targetCategoryId
            });
            alert("콘텐츠 이동이 완료되었습니다.");
            refreshContentList();
            setSelectedContentIds(new Set());
        } catch (error) {
            alert("콘텐츠 이동에 실패했습니다.");
        } finally {
            setIsMoveModalOpen(false);
        }
    };

    const handleDeleteContents = async () => {
        if (selectedContentIds.size === 0) {
            alert("삭제할 콘텐츠를 하나 이상 선택하세요.");
            return;
        }
        if (window.confirm(`${selectedContentIds.size}개의 콘텐츠를 정말 삭제하시겠습니까?`)) {
            try {
                await axios.delete('http://localhost:8081/api/vod-contents', {
                    data: Array.from(selectedContentIds) 
                });
                alert("선택한 콘텐츠가 삭제되었습니다.");
                fetchVodContent(selectedCategory, 0, ''); 
            } catch (error) {
                alert("콘텐츠 삭제에 실패했습니다.");
            }
        }
    };

    const handleContentDoubleClick = (content) => {
        setModalContent(content);
    };
    
    const handleAddCategory = async () => {
        const categoryName = prompt("추가할 카테고리 이름을 입력하세요:", "새 카테고리");
        if (categoryName) {
            try {
                await axios.post('http://localhost:8081/api/vod-categories', {
                    categoryName: categoryName,
                    parentId: selectedCategory ? selectedCategory.id : null, 
                });
                const updatedCategories = await fetchCategories();
                setCategories(updatedCategories);
            } catch (error) {
                alert("카테고리 추가에 실패했습니다.");
            }
        }
    };

    const handleEditCategory = async () => {
        if (!selectedCategory) {
            alert("수정할 카테고리를 선택하세요.");
            return;
        }
        const newCategoryName = prompt("새 카테고리 이름을 입력하세요:", selectedCategory.name);
        if (newCategoryName && newCategoryName !== selectedCategory.name) {
            try {
                await axios.put(`http://localhost:8081/api/vod-categories/${selectedCategory.id}`, {
                    ...selectedCategory,
                    categoryName: newCategoryName
                });
                const updatedCategories = await fetchCategories();
                setCategories(updatedCategories);
            } catch (error) {
                alert("카테고리 수정에 실패했습니다.");
            }
        }
    };

    const handleDeleteCategory = async () => {
        if (!selectedCategory) {
            alert("삭제할 카테고리를 선택하세요.");
            return;
        }
        if (window.confirm(`'${selectedCategory.name}' 카테고리를 정말 삭제하시겠습니까?`)) {
            try {
                await axios.delete(`http://localhost:8081/api/vod-categories/${selectedCategory.id}`);
                setSelectedCategory(null);
                const updatedCategories = await fetchCategories();
                setCategories(updatedCategories);
            } catch (error) {
                alert("카테고리 삭제에 실패했습니다. 하위 카테고리나 콘텐츠가 없는지 확인해주세요.");
            }
        }
    };

    const renderCategoryTree = (nodes) => (
        <ul>
            {nodes.map(node => (
                <li key={node.id}>
                    <span onClick={() => handleCategoryClick(node)} className={selectedCategory?.id === node.id ? 'selected' : ''}>
                        {/* ✅ [수정] categoryName 대신 백엔드 DTO 필드명인 'name'을 사용합니다. */}
                        {node.name}
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
        const buttons = [];
        buttons.push( <button key="prev-group" onClick={() => handlePageChange(startPage - 1)} disabled={startPage === 0}> &lt;&lt; </button> );
        buttons.push( <button key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}> &lt; </button> );
        for (let i = startPage; i <= endPage; i++) {
            buttons.push( <button key={i} onClick={() => handlePageChange(i)} className={currentPage === i ? 'active' : ''} > {i + 1} </button> );
        }
        buttons.push( <button key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}> &gt; </button> );
        buttons.push( <button key="next-group" onClick={() => handlePageChange(endPage + 1)} disabled={endPage >= totalPages - 1}> &gt;&gt; </button> );
        return buttons;
    };

    return (
        <div className="vod-management-container">
            <div className="category-tree">
                <div className="tree-header">
                    <h3>Category</h3>
                    <div className="tree-actions">
                        <button onClick={handleAddCategory} title="새 카테고리 추가">+</button>
                        <button onClick={handleEditCategory} title="선택 카테고리 수정">✎</button>
                        <button onClick={handleDeleteCategory} title="선택 카테고리 삭제">-</button>
                    </div>
                </div>
                {renderCategoryTree(categoryTree)}
            </div>
            <div className="content-panel">
                <div className="content-header">
                    <h2>{selectedCategory ? `${selectedCategory.name} 콘텐츠 목록` : '카테고리를 선택하세요'}</h2>
                    <div className="search-and-actions">
                        <div className="search-box">
                            <input 
                                type="text" 
                                placeholder="제목으로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                            <tr key={content.id} onDoubleClick={() => handleContentDoubleClick(content)}>
                                <td>
                                    <input 
                                        type="checkbox"
                                        checked={selectedContentIds.has(content.id)}
                                        onChange={() => handleContentCheckboxChange(content.id)}
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
                <div className="pagination">
                    {renderPaginationButtons()}
                </div>
            </div>
            
            {modalContent && <VodFileManagementModal 
                content={modalContent} 
                onClose={() => setModalContent(null)}
                onDataChange={refreshContentList} 
            />}
            <CategorySelectionModal
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                onConfirm={executeMove}
                categoryTree={categoryTree}
                currentCategoryId={selectedCategory?.id}
            />
        </div>
    );
}

export default VODManagement;
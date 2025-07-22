import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VodManagement.css';
import VodFileManagementModal from './VodFileManagementModal';

function VODManagement() {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [vodContent, setVodContent] = useState([]);
  const [selectedContentIds, setSelectedContentIds] = useState(new Set());
  const [modalContent, setModalContent] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/vod-categories');
      setCategories(response.data);
    } catch (error) {
      alert("VOD 카테고리 목록을 불러오는 데 실패했습니다.");
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const buildTree = (list, parentId = null) => {
      return list
        .filter(item => item.parentId === parentId)
        .map(item => ({ ...item, children: buildTree(list, item.id) }));
    };
    setCategoryTree(buildTree(categories));
  }, [categories]);

  const handleCategoryClick = (category) => {
    if (selectedCategory && selectedCategory.id === category.id) {
        setSelectedCategory(null);
        setVodContent([]);
    } else {
        setSelectedCategory(category);
        fetchVodContent(category);
    }
    setExpandedIds(prev => {
      const newIds = new Set(prev);
      if (newIds.has(category.id)) newIds.delete(category.id);
      else newIds.add(category.id);
      return newIds;
    });
  };

  const fetchVodContent = async (category) => {
      try {
        const response = await axios.get(`http://localhost:8081/api/vod-contents?categoryId=${category.id}`);
        setVodContent(response.data);
      } catch (error) {
        alert(`${category.categoryName} 콘텐츠 목록을 불러오는 데 실패했습니다.`);
        setVodContent([]);
      }
  };
    
  const navigateToNewContentForm = () => {
    if (!selectedCategory) {
      alert("콘텐츠를 추가할 카테고리를 먼저 선택해주세요.");
      return;
    }
    navigate('/dashboard/vod/new', { state: { categoryId: selectedCategory.id } });
  };

  const handleAddCategory = async () => {
    const categoryName = prompt("추가할 카테고리 이름을 입력하세요:", "새 카테고리");
    if (categoryName) {
      try {
        await axios.post('http://localhost:8081/api/vod-categories', {
          categoryName: categoryName,
          parentId: selectedCategory ? selectedCategory.id : null, 
        });
        fetchCategories();
      } catch (error) {
        alert("카테고리 추가에 실패했습니다.");
      }
    }
  };

  const handleEditCategory = () => {
    if (!selectedCategory) {
      alert("수정할 카테고리를 선택하세요.");
      return;
    }
    navigate(`/dashboard/vod-category/edit/${selectedCategory.id}`);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) {
      alert("삭제할 카테고리를 선택하세요.");
      return;
    }
    if (window.confirm(`'${selectedCategory.categoryName}' 카테고리를 정말 삭제하시겠습니까?`)) {
      try {
        await axios.delete(`http://localhost:8081/api/vod-categories/${selectedCategory.id}`);
        setSelectedCategory(null);
        fetchCategories();
      } catch (error) {
        alert("카테고리 삭제에 실패했습니다.");
      }
    }
  };

  const handleDeselect = () => {
    setSelectedCategory(null);
    setVodContent([]);
    setSelectedContentIds(new Set());
  };
  
  const handleContentCheckboxChange = (contentId) => {
    setSelectedContentIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(contentId)) {
        newSelectedIds.delete(contentId);
      } else {
        newSelectedIds.add(contentId);
      }
      return newSelectedIds;
    });
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      const allIds = new Set(vodContent.map(content => content.id));
      setSelectedContentIds(allIds);
    } else {
      setSelectedContentIds(new Set());
    }
  };

  const handleContentDoubleClick = (content) => {
    setModalContent(content);
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
        if (selectedCategory) {
            // fetchVodContent를 직접 호출하여 목록을 즉시 갱신합니다.
            fetchVodContent(selectedCategory);
        }
      } catch (error) {
        alert("콘텐츠 삭제에 실패했습니다.");
      }
    }
  };

  const renderTree = (nodes) => (
    <ul>
      {nodes.map(node => (
        <li key={node.id}>
          <span onClick={() => handleCategoryClick(node)} className={selectedCategory?.id === node.id ? 'selected' : ''}>
            {node.children && node.children.length > 0 && (
              <span className="toggle-icon">{expandedIds.has(node.id) ? '▾' : '▸'}</span>
            )}
            {node.categoryName}
          </span>
          {node.children && node.children.length > 0 && expandedIds.has(node.id) && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <div className="vod-management-container">
        <div className="category-tree">
          <div className="tree-header">
            <h3>Category</h3>
            <div className="tree-actions">
              <button onClick={handleAddCategory}>+</button>
              <button onClick={handleEditCategory}>✎</button>
              <button onClick={handleDeleteCategory}>-</button>
              <button onClick={handleDeselect} title="선택 해제">⃠</button>
            </div>
          </div>
          {renderTree(categoryTree)}
        </div>
        <div className="content-panel">
          <div className="content-header">
              <h2>{selectedCategory ? `${selectedCategory.categoryName} 콘텐츠 목록` : '카테고리를 선택하세요'}</h2>
              <div className="content-actions">
                  {selectedCategory && (
                      <button onClick={navigateToNewContentForm} className="add-content-btn">새 콘텐츠 추가</button>
                  )}
                  <button>수정</button>
                  <button>이동</button>
                  <button onClick={handleDeleteContents}>삭제</button>
              </div>
          </div>
          
          <table className="user-table">
              <thead>
                  <tr>
                      <th><input type="checkbox" onChange={handleSelectAllChange} /></th>
                      <th>ID</th>
                      <th>카테고리</th>
                      <th>제목</th>
                      <th>포스터 이름</th>
                      <th>노출</th>
                      <th>파일 개수</th>
                      <th>등록/수정일</th>
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
                          <td>{selectedCategory?.categoryName}</td>
                          <td>{content.title}</td>
                          <td>{content.posterPath?.split('_').slice(1).join('_')}</td>
                          <td>{content.exposed ? 'O' : 'X'}</td>
                          <td>-</td>
                          <td>{new Date(content.createdAt).toLocaleString('ko-KR')}</td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>
      </div>
      
      <VodFileManagementModal 
        content={modalContent} 
        onClose={() => setModalContent(null)} 
      />
    </div>
  );
}

export default VODManagement;
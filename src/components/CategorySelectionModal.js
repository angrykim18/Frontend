import React, { useState, useEffect } from 'react';
import './CategorySelectionModal.css';

function CategorySelectionModal({ isOpen, onClose, onConfirm, categoryTree, currentCategoryId }) {
  const [selectedId, setSelectedId] = useState(null);

  // 모달이 열릴 때 선택 상태를 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedId(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (!selectedId) {
      alert("이동할 카테고리를 선택하세요.");
      return;
    }
    if (selectedId === currentCategoryId) {
      alert("현재와 동일한 카테고리로는 이동할 수 없습니다.");
      return;
    }
    onConfirm(selectedId);
  };

  const renderTree = (nodes) => (
    <ul>
      {nodes.map(node => (
        <li key={node.id}>
          <span
            onClick={() => setSelectedId(node.id)}
            className={selectedId === node.id ? 'selected' : ''}
          >
            {node.categoryName}
          </span>
          {node.children && node.children.length > 0 && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-content category-modal">
        <h2>이동할 카테고리 선택</h2>
        <div className="category-tree-container">
          {renderTree(categoryTree)}
        </div>
        <div className="modal-actions">
          <button onClick={handleConfirm}>확인</button>
          <button type="button" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default CategorySelectionModal;
import React from 'react';
import './VodFileManagementModal.css'; // 모달 전용 CSS 파일 (다음에 생성)

function VodFileManagementModal({ content, onClose }) {
  if (!content) {
    return null; // content가 없으면 아무것도 표시하지 않음
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{content.title} - 파일 관리</h2>

        {/* 파일 목록을 표시할 영역 */}
        <div className="file-list">
          <p>파일 목록이 여기에 표시됩니다.</p>
        </div>

        {/* 새 파일을 등록하는 영역 */}
        <div className="file-upload-section">
          <h3>새 파일 등록</h3>
          {/* 파일 등록 기능은 다음에 구현합니다. */}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export default VodFileManagementModal;
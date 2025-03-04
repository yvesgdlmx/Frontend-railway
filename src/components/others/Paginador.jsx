import React from 'react';
const Paginador = ({ currentPage, totalPages, goToPage }) => {
  // No mostrar el paginador si no hay páginas o solo hay una
  if (totalPages <= 1) return null;
  // Función interna para generar los botones de paginación
  const renderPaginationButtons = () => {
    const buttons = [];
    let startPage = currentPage - 2 > 0 ? currentPage - 2 : 1;
    let endPage = startPage + 4 <= totalPages ? startPage + 4 : totalPages;
    if (endPage - startPage < 4) {
      startPage = endPage - 4 > 0 ? endPage - 4 : 1;
    }
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded-md border border-blue-600 font-medium ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => goToPage(1)}
        className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100"
        disabled={currentPage === 1}
      >
        {'<<'}
      </button>
      <button
        onClick={() => goToPage(currentPage - 1)}
        className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100"
        disabled={currentPage === 1}
      >
        Anterior
      </button>
      {renderPaginationButtons()}
      <button
        onClick={() => goToPage(currentPage + 1)}
        className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100"
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
      <button
        onClick={() => goToPage(totalPages)}
        className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-100"
        disabled={currentPage === totalPages}
      >
        {'>>'}
      </button>
    </div>
  );
};
export default Paginador;
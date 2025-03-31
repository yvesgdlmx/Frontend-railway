import React from 'react';

const Heading = ({ title, actions }) => {
  // Separar la primera palabra del resto del título
  const words = title.split(' ');
  const firstWord = words[0];
  const restOfTitle = words.slice(1).join(' ');

  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-500 inline uppercase">{firstWord}</h1>
      <h1 className="text-2xl md:text-3xl  font-bold text-cyan-600 inline uppercase ml-2">{restOfTitle}</h1>
      {actions && <div className="mt-4">{actions}</div>}
    </div>
  );
};

export default Heading;


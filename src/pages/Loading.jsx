import React from 'react';
import Spinner from '../components/common/Spinner';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Spinner size="lg" />
      <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
        Processing your order...
      </p>
    </div>
  );
};

export default Loading;

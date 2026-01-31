import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';

const OrderSuccess = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // For COD, data is in location.state
  const codData = location.state;

  // For Maya, data is in search params
  const mayaOrderId = searchParams.get('order_id');
  const mayaPaymentMethod = searchParams.get('payment_method');

  const orderId = codData?.orderId || mayaOrderId;
  const paymentMethod = codData?.paymentMethod || mayaPaymentMethod;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Order Successful!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thank you for your purchase. Your order is being processed.
        </p>
        {orderId && (
          <div className="mb-6 text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
            <p className="text-gray-800 dark:text-gray-200">
              <strong>Order ID:</strong> {orderId}
            </p>
            {paymentMethod && (
              <p className="text-gray-800 dark:text-gray-200">
                <strong>Payment Method:</strong> {paymentMethod}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/">
            <Button variant="primary" className="w-full">
              Continue Shopping
            </Button>
          </Link>
          <Link to={`/order-confirmation/${orderId}`}>
            <Button variant="secondary" className="w-full">
              Track My Order
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;


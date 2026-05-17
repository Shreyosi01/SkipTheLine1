import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Wallet, QrCode, ArrowRight, ShieldCheck, Loader2, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { api } from '../../api/client';

export const Payment: React.FC = () => {
  const { cart, stalls, addOrder, clearCart } = useApp();
  const navigate = useNavigate();

  const [paymentMode, setPaymentMode] = useState<'upi' | 'counter'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNavigatingToConfirmation, setIsNavigatingToConfirmation] = useState(false);

  // If cart is empty, send them back
  if (cart.length === 0 && !isNavigatingToConfirmation) {
    navigate('/cart');
    return null;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const stall = stalls.find((s) => s.id === cart[0].stallId);
  const stallName = stall?.stallName || 'Stall';
  const upiId = stall?.upiId || 'pay@counter';
  const qrCodeUrl = stall?.qrCodeUrl;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    try {
      // Both UPI and counter start as 'pending' — the vendor confirms receipt in both cases
      const paymentStatus = 'pending';

      const orderPayload = {
        stall_id: parseInt(cart[0].stallId),
        payment_mode: paymentMode,
        payment_status: paymentStatus,
        items: cart.map((item) => ({
          menu_item_id: parseInt(item.id),
          quantity: item.quantity,
        })),
      };

      const res = await api.placeOrder(orderPayload);

      const order = {
        id: String(res.id),
        stallId: String(res.stall_id),
        stallName,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: res.total_price,
        token: res.token,
        status: res.status as any,
        paymentMode: res.payment_mode as any,
        paymentStatus: res.payment_status as any,
        estimatedTime: 15,
        timestamp: new Date(res.created_at),
      };

      setIsNavigatingToConfirmation(true);
      addOrder(order);
      clearCart();
      
      toast.success(paymentMode === 'upi' ? 'Payment successful!' : 'Order placed! Pay at counter.');
      navigate('/order/confirmation', { state: { order } });
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Cart</span>
        </motion.button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center sm:text-left"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center sm:justify-start gap-3">
            <Wallet className="w-10 h-10 text-blue-500" />
            Complete Your Payment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Select payment method to checkout and place your order</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Order Summary & Methods Selection */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Payment Modes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* UPI Option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMode('upi')}
                className={`p-5 rounded-2xl border-2 text-left flex flex-col items-start transition-all duration-200 ${
                  paymentMode === 'upi'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Scan & Pay (UPI)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                  Scan the vendor's QR code using any UPI app to pay instantly.
                </p>
              </motion.button>

              {/* Counter Option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMode('counter')}
                className={`p-5 rounded-2xl border-2 text-left flex flex-col items-start transition-all duration-200 ${
                  paymentMode === 'counter'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Pay at Counter</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                  Skip online transaction, place order now, and pay cash/card at physical stall counter.
                </p>
              </motion.button>
            </div>

            {/* Selection Card Content */}
            <AnimatePresence mode="wait">
              {paymentMode === 'upi' ? (
                <motion.div
                  key="upi-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-sm flex flex-col items-center text-center"
                >
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                    Vendor UPI QR Code
                  </span>

                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-4">
                    <img
                      src={
                        qrCodeUrl
                          ? qrCodeUrl
                          : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                              `upi://pay?pa=${upiId}&pn=${encodeURIComponent(stallName)}&am=${total}&cu=INR`
                            )}`
                      }
                      alt="UPI QR Scanner"
                      className="w-48 h-48 object-contain rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/60 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 mb-2 max-w-full">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                      {upiId}
                    </span>
                    <button
                      onClick={handleCopyUpi}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                      title="Copy UPI VPA"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-normal">
                    Amount: <strong className="text-gray-800 dark:text-white">₹{total.toFixed(2)}</strong>. Scan QR using PhonePe, GooglePay, Paytm, or BHIM to pay instantly.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="counter-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/60 shadow-sm text-center py-10"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 mx-auto mb-4 border border-blue-200 dark:border-blue-900/50">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pay Cash / Card at Counter</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Confirm your order below to get your token number. Head to the stall counter to pay physical cash or swipe your card directly with the vendor.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Side Summary Panel */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800/80 dark:to-indigo-900/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 dark:border-indigo-500/30 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{stallName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Stall Name</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                    {cart.length} item{cart.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="border-t border-blue-200/50 dark:border-indigo-500/20 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Service Fee</span>
                    <span>₹0.00</span>
                  </div>
                </div>

                <div className="border-t border-blue-200/50 dark:border-indigo-500/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Grand Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmOrder}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-blue-500/45 transition-all disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    Confirm Order
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-1.5 text-gray-400 dark:text-gray-500 text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>100% Secure Checkout</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

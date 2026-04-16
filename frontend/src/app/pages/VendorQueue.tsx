import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Clock, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface QueueItemProps {
  order: any;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

const QueueItem: React.FC<QueueItemProps> = ({ order, index, moveItem }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'queue-item',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'queue-item',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveItem(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-move"
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <GripVertical className="w-5 h-5 text-gray-500" />

        {/* Position Number */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
          {index + 1}
        </div>

        {/* Token */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
          {order.token}
        </div>

        {/* Order Info */}
        <div className="flex-1">
          <p className="text-white font-semibold">{order.items.length} items</p>
          <p className="text-gray-400 text-sm">
            {new Date(order.timestamp).toLocaleTimeString()}
          </p>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            order.status === 'placed'
              ? 'bg-blue-500/20 text-blue-400'
              : order.status === 'preparing'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-green-500/20 text-green-400'
          }`}
        >
          {order.status}
        </span>

        {/* Wait Time */}
        <div className="flex items-center gap-2 text-purple-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{order.estimatedTime}m</span>
        </div>
      </div>
    </motion.div>
  );
};

export const VendorQueue: React.FC = () => {
  const navigate = useNavigate();
  const { orders, user } = useApp();
  // Filter orders for this vendor's stall only
  const [queueOrders, setQueueOrders] = React.useState(
    orders.filter((o) => o.status !== 'completed' && o.stallId === user?.stallId)
  );

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = queueOrders[dragIndex];
    const newQueue = [...queueOrders];
    newQueue.splice(dragIndex, 1);
    newQueue.splice(hoverIndex, 0, dragItem);
    setQueueOrders(newQueue);
  };

  const totalWaitTime = queueOrders.reduce((sum, o) => sum + o.estimatedTime, 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-900 pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            onClick={() => navigate('/vendor')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Queue Management</h1>
            <p className="text-gray-400">Drag and drop to reorder the queue</p>
          </motion.div>

          {/* Queue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30"
            >
              <Users className="w-8 h-8 text-blue-400 mb-3" />
              <p className="text-gray-400 text-sm mb-1">Total in Queue</p>
              <p className="text-3xl font-bold text-white">{queueOrders.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
            >
              <Clock className="w-8 h-8 text-purple-400 mb-3" />
              <p className="text-gray-400 text-sm mb-1">Total Wait Time</p>
              <p className="text-3xl font-bold text-white">{totalWaitTime} min</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30"
            >
              <Clock className="w-8 h-8 text-green-400 mb-3" />
              <p className="text-gray-400 text-sm mb-1">Avg Wait Time</p>
              <p className="text-3xl font-bold text-white">
                {queueOrders.length > 0 ? Math.round(totalWaitTime / queueOrders.length) : 0} min
              </p>
            </motion.div>
          </div>

          {/* Queue Visual */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="bg-gray-800/30 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {queueOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                      {order.token}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Queue List */}
          {queueOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Users className="w-20 h-20 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-semibold text-white mb-2">No orders in queue</h2>
              <p className="text-gray-400">Orders will appear here as they come in</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-4">
                💡 Drag and drop orders to change their priority in the queue
              </p>
              {queueOrders.map((order, index) => (
                <QueueItem
                  key={order.id}
                  order={order}
                  index={index}
                  moveItem={moveItem}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

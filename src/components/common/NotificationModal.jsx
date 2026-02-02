import React, { useState, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { IoChevronDown, IoStorefrontOutline } from 'react-icons/io5';
import { HiOutlineMail } from 'react-icons/hi';

// Sample notification data
const notificationsData = [
  {
    id: 1,
    type: 'user',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'John Doe',
    message: 'It is a long established fact that a reader will be distracted',
    time: '2 min ago',
    isUnread: true,
    isNew: true,
  },
  {
    id: 2,
    type: 'store',
    icon: IoStorefrontOutline,
    iconBg: 'bg-success-main',
    name: 'Store Verification Done',
    message: 'We have successfully received your request.',
    time: '2 min ago',
    isUnread: true,
    isNew: false,
  },
  {
    id: 3,
    type: 'mail',
    icon: HiOutlineMail,
    iconBg: 'bg-primary-main',
    name: 'Check Your Mail.',
    message: 'All done! Now check your inbox as you will receive email',
    time: '2 min ago',
    isUnread: false,
    isNew: false,
  },
];

const filterOptions = ['All Notification', 'Unread', 'Read'];

const NotificationModal = memo(({ isOpen, onClose, anchorRef }) => {
  const [filter, setFilter] = useState('All Notification');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const modalRef = useRef(null);
  const filterRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target)
      ) {
        // Move focus to body before closing to avoid aria-hidden focus trap
        if (document.activeElement && modalRef.current.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  // Prevent background scroll when modal is open (lock both body and html)
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilterDropdown &&
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  // Count unread notifications
  const unreadCount = notificationsData.filter((n) => n.isUnread).length;

  // Filter notifications
  const filteredNotifications = notificationsData.filter((notification) => {
    if (filter === 'Unread') return notification.isUnread;
    if (filter === 'Read') return !notification.isUnread;
    return true;
  });

  const handleMarkAllRead = () => {
    // Handle mark all as read logic
    console.log('Mark all as read');
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed sm:absolute right-0 sm:top-full top-0 left-0 sm:left-auto mt-12 sm:mt-2 w-full sm:w-82.5 max-w-xs sm:max-w-none mx-auto sm:mx-0 bg-paper rounded-t-lg sm:rounded-lg shadow-2xl border border-grey-200 z-50 overflow-hidden"
      style={{ boxShadow: '0 24px 60px rgba(16,24,40,0.18), 0 8px 24px rgba(16,24,40,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-grey-100">
        <div className="flex items-center gap-2">
          <span className="text-grey-900 font-semibold text-base">All Notification</span>
          {unreadCount > 0 && (
            <span className="bg-secondary-main text-white text-xs font-medium px-2 py-0.5 rounded-full min-w-5 text-center">
              {unreadCount.toString().padStart(2, '0')}
            </span>
          )}
        </div>
        <button
          onClick={handleMarkAllRead}
          className="text-primary-main text-sm font-medium hover:underline cursor-pointer"
        >
          Mark as all read
        </button>
      </div>

      {/* Filter Dropdown */}
      <div className="px-4 py-3 border-b border-grey-100">
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 border border-grey-200 rounded-lg bg-paper hover:border-grey-300 cursor-pointer transition-colors"
          >
            <span className="text-grey-700 text-sm">{filter}</span>
            <IoChevronDown
              className={`text-grey-500 transition-transform ${
                showFilterDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showFilterDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-paper border border-grey-200 rounded-lg shadow-lg z-10">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setFilter(option);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-grey-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg ${
                    filter === option ? 'bg-grey-50 text-secondary-main font-medium' : 'text-grey-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className="flex gap-3 px-4 py-3 hover:bg-grey-50 cursor-pointer transition-colors border-b border-grey-100 last:border-b-0"
          >
            {/* Avatar or Icon */}
            {notification.type === 'user' ? (
              <img
                src={notification.avatar}
                alt={notification.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.iconBg}`}
              >
                <notification.icon className="text-white text-lg" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-grey-900 font-medium text-sm truncate">
                  {notification.name}
                </span>
                <span className="text-grey-500 text-xs whitespace-nowrap">
                  {notification.time}
                </span>
              </div>
              <p className="text-grey-500 text-sm mt-0.5 line-clamp-2">
                {notification.message}
              </p>

              {/* Tags */}
              <div className="flex gap-2 mt-2">
                {notification.isUnread && (
                  <span className="text-primary-main text-xs font-medium px-2 py-0.5 rounded-full border border-primary-main">
                    Unread
                  </span>
                )}
                {notification.isNew && (
                  <span className="text-orange-dark text-xs font-medium px-2 py-0.5 rounded-full border border-orange-dark">
                    New
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-grey-100 text-center">
        <button className="text-primary-main text-sm font-medium hover:underline cursor-pointer">
          View All
        </button>
      </div>
    </div>
  );
});

NotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  anchorRef: PropTypes.object,
};

export default NotificationModal;

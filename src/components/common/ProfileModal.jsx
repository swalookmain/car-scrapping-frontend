import React, { useState, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { IoChevronDown, IoSettingsOutline, IoLogOutOutline } from 'react-icons/io5';
import { HiOutlineMail } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const ProfileModal = memo(({ isOpen, onClose, anchorRef }) => {
  const modalRef = useRef(null);
  const [dndEnabled, setDndEnabled] = useState(true);
  const [allowNotifications, setAllowNotifications] = useState(false);
  const { logout, user } = useAuth();
  const roleMap = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    STAFF: 'Staff',
  };
  const displayName = user?.name || user?.email || 'User';
  const displayRole = user?.role ? (roleMap[user.role] || user.role) : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target)
      ) {
        if (document.activeElement && modalRef.current.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

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

  

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed sm:absolute right-0 sm:top-full top-0 left-0 sm:left-auto mt-12 sm:mt-2 w-full sm:w-80 max-w-xs sm:max-w-none mx-auto sm:mx-0 bg-paper rounded-t-lg sm:rounded-lg shadow-2xl border border-grey-200 z-50 overflow-hidden"
      style={{ boxShadow: '0 24px 60px rgba(16,24,40,0.18), 0 8px 24px rgba(16,24,40,0.08)' }}
    >
      <div className="px-4 py-4 border-b border-grey-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-grey-900 font-semibold text-lg">Good Morning, {displayName}</div>
            <div className="text-grey-500 text-sm">{displayRole}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-main flex items-center justify-center text-white font-semibold text-sm select-none">
              {user?.avatar
                ? <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
                : (displayName.charAt(0) || '?').toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-grey-100">
        <div className="relative">
          <input
            aria-label="Search profile options"
            placeholder="Search profile options"
            className="w-full px-4 py-2 border border-grey-200 rounded-lg bg-paper text-sm text-grey-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="px-4 py-4 border-b border-grey-100">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-grey-900 font-medium">Start DND Mode</div>
            <label className="relative inline-flex items-center cursor-pointer" aria-label="Toggle DND">
              <input
                type="checkbox"
                checked={dndEnabled}
                onChange={(e) => setDndEnabled(e.target.checked)}
                className="sr-only"
                aria-checked={dndEnabled}
              />
              <div
                role="switch"
                aria-checked={dndEnabled}
                style={{
                  width: 40,
                  height: 20,
                  borderRadius: 9999,
                  backgroundColor: dndEnabled ? 'var(--color-secondary-main)' : 'var(--color-grey-200)',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 180ms ease'
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 9999,
                    background: '#fff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                    transform: dndEnabled ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 180ms ease'
                  }}
                />
              </div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-grey-900 font-medium">Allow Notifications</div>
            <label className="relative inline-flex items-center cursor-pointer" aria-label="Toggle Notifications">
              <input
                type="checkbox"
                checked={allowNotifications}
                onChange={(e) => setAllowNotifications(e.target.checked)}
                className="sr-only"
                aria-checked={allowNotifications}
              />
              <div
                role="switch"
                aria-checked={allowNotifications}
                style={{
                  width: 40,
                  height: 20,
                  borderRadius: 9999,
                  backgroundColor: allowNotifications ? 'var(--color-secondary-main)' : 'var(--color-grey-200)',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 180ms ease'
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 9999,
                    background: '#fff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                    transform: allowNotifications ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 180ms ease'
                  }}
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="px-4 py-3">
        <button className="w-full flex items-center gap-3 px-2 py-3 text-left text-grey-700 hover:bg-grey-50 rounded-md cursor-pointer">
          <IoSettingsOutline className="text-lg" />
          <span className="font-medium">Account Settings</span>
        </button>

        

        <button
          className="w-full flex items-center gap-3 px-2 py-3 text-left text-grey-700 hover:bg-grey-50 rounded-md mt-1 cursor-pointer"
          onClick={async () => {
            try {
              if (logout) await logout();
            } catch (err) {
              // ignore
            } finally {
              window.location.href = '/';
            }
          }}
        >
          <IoLogOutOutline className="text-lg" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
});

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  anchorRef: PropTypes.object,
};

export default ProfileModal;

import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import api from '../../https/api';

const AccountModal = ({ isOpen, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ fullName: '', phone: '', email: '', role: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const loadProfile = async () => {
      if (!isOpen || !userId) return;
      setError('');
      setSuccess('');
      try {
        const res = await api.get(`/auth/profile/${userId}`);
        setProfile({
          fullName: res.data?.FullName || '',
          phone: res.data?.Phone || '',
          email: res.data?.Email || '',
          role: res.data?.Role || '',
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Không tải được thông tin.');
      }
    };

    loadProfile();
  }, [isOpen, userId]);

  const handleUpdateProfile = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/auth/profile/${userId}`, {
        fullName: profile.fullName,
        phone: profile.phone,
      });
      localStorage.setItem('displayName', profile.fullName || profile.email || '');
      localStorage.setItem('phone', profile.phone || '');
      setSuccess('Cập nhật thông tin thành công.');
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    if (!oldPassword || !newPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu.');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp.');
      setLoading(false);
      return;
    }
    try {
      await api.put(`/auth/password/${userId}`, {
        oldPassword,
        newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Đổi mật khẩu thành công.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Thông tin tài khoản" isOpen={isOpen} onClose={onClose}>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label className='text-[#ababab] text-sm'>Họ và tên</label>
          <input
            type='text'
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
          />
          <label className='text-[#ababab] text-sm'>Email</label>
          <input
            type='email'
            value={profile.email}
            disabled
            className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#666] focus:outline-none'
          />
          <label className='text-[#ababab] text-sm'>Số điện thoại</label>
          <input
            type='tel'
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
          />
          <label className='text-[#ababab] text-sm'>Vai trò</label>
          <input
            type='text'
            value={profile.role}
            disabled
            className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#666] focus:outline-none'
          />
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className='mt-2 bg-[#d69a03] hover:bg-[#9c7000] text-[#f5f5f5] py-3 rounded-lg font-semibold'
          >
            Cập nhật thông tin
          </button>
        </div>

        <div className='h-px bg-[#2c2c2c]' />

        <div className='flex flex-col gap-2'>
          <label className='text-[#ababab] text-sm'>Mật khẩu hiện tại</label>
          <input
            type='password'
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
          />
          <label className='text-[#ababab] text-sm'>Mật khẩu mới</label>
          <input
            type='password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
          />
          <label className='text-[#ababab] text-sm'>Nhập lại mật khẩu mới</label>
          <input
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
          />
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className='mt-2 bg-[#2c4c3f] hover:bg-[#1e342b] text-[#f5f5f5] py-3 rounded-lg font-semibold'
          >
            Đổi mật khẩu
          </button>
        </div>

        {error && <p className='text-red-400 text-sm'>{error}</p>}
        {success && <p className='text-green-400 text-sm'>{success}</p>}
      </div>
    </Modal>
  );
};

export default AccountModal;
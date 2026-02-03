import React, { useEffect, useState } from 'react';
import api from '../https/api';

const Account = () => {
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ fullName: '', role: '', phone: '', email: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      try {
        const res = await api.get(`/auth/profile/${userId}`);
        setProfile((prev) => ({
          ...prev,
          phone: res.data?.Phone || '',
          email: res.data?.Email || '',
        }));
      } catch {
        setProfile((prev) => ({ ...prev }));
      }
    };

    loadProfile();
  }, [userId]);

  const handleUpdateProfile = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/auth/profile/${userId}`, {
        fullName: profile.fullName || null,
        phone: profile.phone,
      });
      localStorage.setItem('displayName', profile.fullName || profile.email || '');
      localStorage.setItem('phone', profile.phone || '');
      setSuccess('Cập nhật thông tin thành công.');
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
    <section className='flex bg-[#1f1f1f] min-h-[calc(100vh-5rem)] pb-28 px-8 py-6 justify-center'>
      <div className='bg-[#1a1a1a] rounded-2xl p-8'>
        <div className='flex items-center gap-4 mb-6'>
          <button
            onClick={() => setTab('profile')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              tab === 'profile' ? 'bg-[#2b2b2b] text-[#f6b100]' : 'bg-[#222] text-[#ababab]'
            }`}
          >
            Thông tin tài khoản
          </button>
          <button
            onClick={() => setTab('password')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              tab === 'password' ? 'bg-[#2b2b2b] text-[#f6b100]' : 'bg-[#222] text-[#ababab]'
            }`}
          >
            Thay đổi mật khẩu
          </button>
        </div>

        {tab === 'profile' && (
          <div className='max-w-xl flex flex-col gap-4'>
            <label className='text-[#ababab] text-sm'>Họ và tên</label>
            <input
              type='text'
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder='Nhập họ và tên'
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
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              placeholder='Nhập vai trò'
              className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
            />
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className='mt-2 bg-[#d69a03] hover:bg-[#9c7000] text-[#f5f5f5] py-3 rounded-lg font-semibold'
            >
              Cập nhật thông tin
            </button>
          </div>
        )}

        {tab === 'password' && (
          <div className='max-w-xl flex flex-col gap-4'>
            <label className='text-[#ababab] text-sm'>Mật khẩu hiện tại</label>
            <input
              type='password'
              autoComplete='new-password'
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
            />
            <label className='text-[#ababab] text-sm'>Mật khẩu mới</label>
            <input
              type='password'
              autoComplete='new-password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='bg-[#1f1f1f] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
            />
            <label className='text-[#ababab] text-sm'>Nhập lại mật khẩu mới</label>
            <input
              type='password'
              autoComplete='new-password'
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
        )}

        {error && <p className='text-red-400 text-sm mt-4'>{error}</p>}
        {success && <p className='text-green-400 text-sm mt-4'>{success}</p>}
      </div>
    </section>
  );
};

export default Account;
import React, { useState } from 'react'
import { FaUtensils } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../https/api';

const registerRoles = [
  { key: 'waiter', label: 'Phục vụ' },
  { key: 'cashier', label: 'Thu ngân' },
];

const Auth = () => {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('waiter');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const resetMessage = () => {
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    resetMessage();
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        await api.post('/auth/register', { email, password, fullName: name, phone });
        setSuccess('Đăng ký thành công. Bạn có thể đăng nhập ngay.');
        localStorage.setItem('role', role);
        localStorage.setItem('displayName', name || '');
        localStorage.setItem('phone', phone || '');
        setMode('login');
      } else {
        const res = await api.post('/auth/login', { email, password });
        const userId = res.data?.userId;
        if (userId) {
          localStorage.setItem('userId', String(userId));
        }
        localStorage.setItem('role', res.data?.role || role);
        localStorage.setItem('displayName', res.data?.fullName || name || email || '');
        localStorage.setItem('phone', res.data?.phone || phone || '');
        navigate('/');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Xử lý thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6 py-10'>
      <div className='w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl bg-[#151515] flex'>
        <div className='hidden md:flex flex-1 relative'>
          <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.85))]'/>
          <div className='relative z-10 p-10 flex flex-col justify-between w-full'>
            <div className='text-[#f5f5f5] text-sm font-medium tracking-wide'>
              Restasty
            </div>
            <div className='text-[#f5f5f5] text-xl leading-relaxed italic'>
              “Phục vụ khách hàng bằng sự tận tâm và thân thiện, bạn sẽ luôn được tin yêu.”
              <div className='mt-3 text-[#f6b100] text-base'>- Nhà sáng lập Restasty</div>
            </div>
          </div>
          <div
            className='absolute inset-0 bg-[url("/images/phoBo.jpg")] bg-cover bg-center opacity-35'
          />
        </div>

        <div className='flex-[1.2] bg-[#1a1a1a] p-10 md:p-14'>
          <div className='flex flex-col items-center gap-2 mb-8'>
            <div className='h-12 w-12 rounded-full bg-[#222] flex items-center justify-center'>
              <FaUtensils className='text-[#f6b100] text-xl'/>
            </div>
            <div className='text-[#f5f5f5] text-sm tracking-wide'>Restasty</div>
            <h1 className='text-[#f6b100] text-2xl font-semibold'>
              {mode === 'register' ? 'Đăng ký nhân viên' : 'Đăng nhập hệ thống'}
            </h1>
          </div>

          <div className='flex gap-2 mb-6'>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                mode === 'register' ? 'bg-[#2b2b2b] text-[#f6b100]' : 'bg-[#222] text-[#ababab]'
              }`}
            >
              Đăng ký
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                mode === 'login' ? 'bg-[#2b2b2b] text-[#f6b100]' : 'bg-[#222] text-[#ababab]'
              }`}
            >
              Đăng nhập
            </button>
          </div>

          <form className='flex flex-col gap-4'>
            {mode === 'register' && (
              <>
                <label className='text-[#ababab] text-sm'>Họ và tên</label>
                <input
                  type='text'
                  placeholder='Nhập họ và tên'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='bg-[#222] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
                />
              </>
            )}

            <label className='text-[#ababab] text-sm'>Email</label>
            <input
              type='email'
              placeholder='Nhập email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='bg-[#222] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
            />

            {mode === 'register' && (
              <>
                <label className='text-[#ababab] text-sm'>Số điện thoại</label>
                <input
                  type='tel'
                  placeholder='Nhập số điện thoại'
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className='bg-[#222] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
                />
              </>
            )}

            <label className='text-[#ababab] text-sm'>Mật khẩu</label>
            <input
              type='password'
              placeholder='Nhập mật khẩu'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='bg-[#222] px-4 py-3 rounded-lg text-[#f5f5f5] focus:outline-none'
            />

            {mode === 'register' && (
              <>
                <label className='text-[#ababab] text-sm'>Chọn vai trò</label>
                <div className='grid grid-cols-2 gap-2'>
                  {registerRoles.map((r) => (
                    <button
                      key={r.key}
                      type='button'
                      onClick={() => setRole(r.key)}
                      className={`py-2 rounded-lg text-sm font-semibold ${
                        role === r.key
                          ? 'bg-[#2b2b2b] text-[#f6b100]'
                          : 'bg-[#222] text-[#ababab]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              type='button'
              onClick={handleSubmit}
              className={`mt-4 text-[#1a1a1a] py-3 rounded-lg font-semibold ${
                loading ? 'bg-[#8a6a1a]' : 'bg-[#f6b100] hover:bg-[#d69a03]'
              }`}
            >
              {loading ? 'Đang xử lý...' : mode === 'register' ? 'Đăng ký' : 'Đăng nhập'}
            </button>
            {error && <p className='text-red-400 text-sm mt-2'>{error}</p>}
            {success && <p className='text-green-400 text-sm mt-2'>{success}</p>}
          </form>

          <p className='text-[#ababab] text-sm mt-6 text-center'>
            {mode === 'register' ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <button
              onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
              className='text-[#f6b100] font-semibold'
            >
              {mode === 'register' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
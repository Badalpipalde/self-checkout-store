import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';
import api from '../services/api';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

export default function AuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      api.get('/auth/me').then((res) => {
        dispatch(setUser(res.data.user));
        toast.success('Signed in with Google! 🎉');
        const role = res.data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'staff') navigate('/staff');
        else navigate('/scan');
      }).catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, []);

  return <Loader fullScreen text="Signing you in..." />;
}

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useGetMeQuery } from '../../features/user/useApi';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { setCredentials, selectAccessToken } from '../../features/auth/authSlice';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSocket } from '../../hooks/useSocket';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const { data: meData } = useGetMeQuery();

  useEffect(() => {
    if (meData?.data && accessToken) {
      dispatch(setCredentials({
        accessToken,
        user: meData.data,
      }));
    }
  }, [meData, accessToken, dispatch]);


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto w-full min-w-0">
          <Outlet />
        </main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

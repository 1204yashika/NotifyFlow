import { useNavigate } from 'react-router-dom';
import { useGetMyWorkspacesQuery } from '../workspaceApi';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { setActiveWorkspace, selectActiveWorkspaceId } from '../workspaceSlice';

const COLORS = ['#534AB7', '#1D9E75', '#D85A30', '#EF9F27', '#2563eb'];

export default function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeId = useAppSelector(selectActiveWorkspaceId);
  const { data, isLoading } = useGetMyWorkspacesQuery();

  const workspaces = data?.data ?? [];

  const handleSelect = (id: string) => {
    dispatch(setActiveWorkspace(id));
    navigate(`/workspace/${id}`);
  };

  if (isLoading) return (
    <div className="px-4 py-2 text-xs text-gray-400">Loading...</div>
  );

  return (
    <div className="flex flex-col gap-1 px-2">
      {workspaces.map((ws, i) => (
        <button
          key={ws._id}
          onClick={() => handleSelect(ws._id)}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm w-full text-left
            ${activeId === ws._id
              ? 'bg-[#EEEDFE] text-[#534AB7]'
              : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: COLORS[i % COLORS.length] }}
          />
          <span className="truncate">{ws.name}</span>
        </button>
      ))}
    </div>
  );
}
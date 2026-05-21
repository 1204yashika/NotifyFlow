type BadgeVariant = 'owner' | 'member' | 'viewer';

const styles: Record<BadgeVariant, string> = {
  owner:  'bg-[#EEEDFE] text-[#534AB7]',
  member: 'bg-[#E1F5EE] text-[#1D9E75]',
  viewer: 'bg-gray-100 text-gray-500',
};

export default function Badge({ role }: { role: BadgeVariant }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${styles[role]}`}>
      {role}
    </span>
  );
}
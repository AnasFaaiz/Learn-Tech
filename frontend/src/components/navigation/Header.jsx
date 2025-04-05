import { Search } from 'lucide-react';

export const Header = ({ user }) => {
  return (
    <header className="header">
      <div className="search-bar">
        <Search size={20} />
        <input type="text" placeholder="Search for courses, topics, or skills..." />
      </div>
      <div className="user-profile">
        <span className="user-name">{user.first_name || user.username}</span>
        <div className="avatar">
          {user.first_name ? user.first_name[0] : user.username[0]}
          {user.last_name ? user.last_name[0] : ''}
        </div>
      </div>
    </header>
  );
}; 
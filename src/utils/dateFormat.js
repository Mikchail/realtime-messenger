// Format date to a readable format (e.g., "Today at 3:45 PM" or "Yesterday at 3:45 PM" or "May 15 at 3:45 PM")
export const formatMessageTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  // Format time part (3:45 PM)
  const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
  const timeString = date.toLocaleTimeString(undefined, timeOptions);
  
  // Check if today
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return `Today at ${timeString}`;
  }
  
  // Check if yesterday
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday at ${timeString}`;
  }
  
  // Otherwise format as "May 15 at 3:45 PM"
  const dateOptions = { month: 'short', day: 'numeric' };
  const localedateString = date.toLocaleDateString(undefined, dateOptions);
  return `${localedateString} at ${timeString}`;
};

// Format relative date (e.g., "2 minutes ago", "1 hour ago", "3 days ago")
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSec < 60) {
    return 'just now';
  }
  
  if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  
  // If more than a week, use the other format
  return formatMessageTime(dateString);
};

// Format for chat list (most recent message)
export const formatChatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  // Time format
  const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
  const timeString = date.toLocaleTimeString(undefined, timeOptions);
  
  // Today - show time only
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return timeString;
  }
  
  // Yesterday - show "Yesterday"
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }
  
  // Within this week - show day name
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    const dayOptions = { weekday: 'short' };
    return date.toLocaleDateString(undefined, dayOptions);
  }
  
  // Older - show date
  const dateOptions = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, dateOptions);
}; 
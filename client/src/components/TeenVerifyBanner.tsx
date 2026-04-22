import React from 'react';
import { FiMail, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const TeenVerifyBanner: React.FC = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = React.useState(false);

  // Show for teens who are not yet verified by parent (false or undefined)
  if (!user || user.role !== 'teen' || user.verifiedByParent === true || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-200 px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <FiMail className="w-4 h-4 flex-shrink-0 text-amber-400" />
        <span>
          Ask your parent to check their email and approve your account. Until then, your account is not yet verified.
        </span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-amber-500/20 text-amber-400 flex-shrink-0"
        aria-label="Dismiss"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TeenVerifyBanner;

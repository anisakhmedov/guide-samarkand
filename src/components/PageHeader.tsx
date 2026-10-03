import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Title row for Options sub-pages: a back button (to the Options hub by default) + title.
export function PageHeader({ title, onBack, aside }: { title: ReactNode; onBack?: () => void; aside?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="page-header">
      <button type="button" className="page-header__back" onClick={onBack ?? (() => navigate('/'))} aria-label="Back">
        <ArrowLeft size={20} />
      </button>
      <h1>{title}</h1>
      {aside}
    </div>
  );
}

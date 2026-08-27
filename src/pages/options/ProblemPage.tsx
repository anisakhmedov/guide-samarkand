import { useState } from 'react';
import { RequestForm } from '../../components/RequestForm';
import { api } from '../../api/client';
import { useLang } from '../../context/LangContext';

const CATEGORIES = ['noise', 'ac', 'plumbing', 'cleanliness', 'other'];

export function ProblemPage() {
  const { t } = useLang();
  const [category, setCategory] = useState('noise');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { url } = await api.post<{ url: string }>('/upload/guest', form);
      setPhoto(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <RequestForm
      type="problem"
      title={t('options.problem')}
      subtitle={t('options.problem.subtitle')}
      payload={{ category, description, photo }}
      disabled={!description.trim() || uploading}
      onSentReset={() => {
        setCategory('noise');
        setDescription('');
        setPhoto('');
      }}
    >
      <div className="field">
        <label>{t('options.problem.category')}</label>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`options.problem.category.${c}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>{t('options.problem.description')}</label>
        <textarea className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="field">
        <label>{t('options.problem.photo')}</label>
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
      </div>
    </RequestForm>
  );
}

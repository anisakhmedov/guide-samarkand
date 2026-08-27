import { useState } from 'react';
import { RequestForm } from '../../components/RequestForm';
import { useLang } from '../../context/LangContext';

export function ExtensionPage() {
  const { t } = useLang();
  const [until, setUntil] = useState('');
  const [note, setNote] = useState('');

  return (
    <RequestForm
      type="extension"
      title={t('options.extension')}
      subtitle={t('options.extension.subtitle')}
      payload={{ until, note }}
      disabled={!until}
      onSentReset={() => {
        setUntil('');
        setNote('');
      }}
    >
      <div className="field">
        <label>{t('options.extension.until')}</label>
        <input className="input" type="date" value={until} onChange={(e) => setUntil(e.target.value)} required />
      </div>
      <div className="field">
        <label>{t('options.form.note')}</label>
        <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </RequestForm>
  );
}

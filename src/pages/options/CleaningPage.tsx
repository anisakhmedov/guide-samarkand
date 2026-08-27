import { useState } from 'react';
import { RequestForm } from '../../components/RequestForm';
import { useLang } from '../../context/LangContext';

export function CleaningPage() {
  const { t } = useLang();
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  return (
    <RequestForm
      type="cleaning"
      title={t('options.cleaning')}
      subtitle={t('options.cleaning.subtitle')}
      payload={{ time, note }}
      onSentReset={() => {
        setTime('');
        setNote('');
      }}
    >
      <div className="field">
        <label>{t('options.cleaning.time')}</label>
        <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div className="field">
        <label>{t('options.form.note')}</label>
        <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </RequestForm>
  );
}

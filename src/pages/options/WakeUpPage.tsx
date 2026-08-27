import { useState } from 'react';
import { RequestForm } from '../../components/RequestForm';
import { useLang } from '../../context/LangContext';

export function WakeUpPage() {
  const { t } = useLang();
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  return (
    <RequestForm
      type="wake_up"
      title={t('options.wakeUp')}
      subtitle={t('options.wakeUp.subtitle')}
      payload={{ time, note }}
      disabled={!time}
      onSentReset={() => {
        setTime('');
        setNote('');
      }}
    >
      <div className="field">
        <label>{t('options.wakeUp.time')}</label>
        <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      </div>
      <div className="field">
        <label>{t('options.form.note')}</label>
        <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </RequestForm>
  );
}

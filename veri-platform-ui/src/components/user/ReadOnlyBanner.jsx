import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ReadOnlyBanner() {
  return (
    <div className="readonly-banner">
      <div className="readonly-banner-icon">
        <ShieldCheck size={22} />
      </div>
      <div className="readonly-banner-content">
        <div className="readonly-banner-title">Salt Okunur Mod</div>
        <div className="readonly-banner-desc">
          Bu formu daha önce doldurdunuz, sadece okuma modundasınız.
          Değişiklik yapılamaz.
        </div>
      </div>
    </div>
  );
}
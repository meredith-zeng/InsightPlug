
import React from 'react';
import { UserProfile } from '../types';

interface CalculatorProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ profile, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    onChange({
      ...profile,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0
    });
  };

  const InputGroup = ({ label, name, value, type = 'number', step = '1', prefix = '' }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span>}
        <input
          type={type}
          name={name}
          value={value}
          step={step}
          onChange={handleChange}
          className={`w-full bg-slate-50 border border-slate-200 rounded-lg py-2 ${prefix ? 'pl-7' : 'pl-3'} pr-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-slate-800`}
        />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Your Driving Habits</h3>
        {/* Updated property names to match types.ts */}
        <InputGroup label="Annual Mileage" name="annualMileage" value={profile.annualMileage} step="500" />
        <InputGroup label="Gas Price ($/gal)" name="gasPrice" value={profile.gasPrice} step="0.1" prefix="$" />
        <InputGroup label="Electricity Rate ($/kWh)" name="electricRate" value={profile.electricRate} step="0.01" prefix="$" />
        <InputGroup label="Ownership Period (Years)" name="ownershipYears" value={profile.ownershipYears} step="1" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Vehicle Details</h3>
        {/* Updated property names to match types.ts */}
        <InputGroup label="ICE Car Price" name="icePrice" value={profile.icePrice} step="1000" prefix="$" />
        <InputGroup label="Gas Car MPG" name="iceMpg" value={profile.iceMpg} step="1" />
        <InputGroup label="EV Car Price" name="evPrice" value={profile.evPrice} step="1000" prefix="$" />
        <InputGroup label="Federal/State Incentive" name="taxIncentive" value={profile.taxIncentive} step="500" prefix="$" />
      </div>
    </div>
  );
};

export default Calculator;

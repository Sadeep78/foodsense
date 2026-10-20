import React from 'react';
import { KPICardData } from '../types';
import { KpiCard } from './common/KpiCard';

interface KPICardProps {
  data: KPICardData;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ data, className }) => {
  return <KpiCard data={data} className={className} />;
};

export default KPICard;

cat > src/app/interfaces/report.interface.ts << 'EOF'
export interface Report {
  id: number;
  title: string;
  type: 'Financial' | 'Sales' | 'Inventory' | 'Customer';
  data: any;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  isSensitive: boolean;
  accessLevel: 'Public' | 'Restricted' | 'Confidential';
}

export interface FinancialReport extends Report {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  taxes: number;
  currency: string;
}
EOF
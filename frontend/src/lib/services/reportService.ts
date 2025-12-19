import api from './api';
import type { ReportFilter, ReportSummary, ApiResponse, ServiceRecord, Expense } from '../types';
import { serviceService } from './serviceService';
import { expenseService } from './expenseService';

const USE_MOCK = true;

export const reportService = {
  /**
   * Get report summary
   */
  async getSummary(filter?: ReportFilter): Promise<ReportSummary> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Get data from other services
      const services = await serviceService.getAll(filter?.vehicleId);
      const expenses = await expenseService.getAll(filter?.vehicleId);
      
      // Calculate totals
      const totalServiceCost = services.reduce((sum, s) => sum + s.cost, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      
      // Group by category
      const costByCategory: Record<string, number> = {};
      
      // Add service costs
      services.forEach(s => {
        const key = `service_${s.type}`;
        costByCategory[key] = (costByCategory[key] || 0) + s.cost;
      });
      
      // Add expense costs
      expenses.forEach(e => {
        costByCategory[e.category] = (costByCategory[e.category] || 0) + e.amount;
      });
      
      // Mock monthly data
      const costByMonth = [
        { month: '1403/07', amount: 850000 },
        { month: '1403/08', amount: 1200000 },
        { month: '1403/09', amount: 1550000 },
      ];
      
      return {
        totalServiceCost,
        totalExpenses,
        totalCost: totalServiceCost + totalExpenses,
        serviceCount: services.length,
        expenseCount: expenses.length,
        costByCategory,
        costByMonth,
      };
    }

    const response = await api.get<ApiResponse<ReportSummary>>('/reports/summary/', {
      params: filter,
    });
    return response.data.data;
  },

  /**
   * Export report as CSV
   */
  async exportCSV(filter?: ReportFilter): Promise<Blob> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock CSV
      const services = await serviceService.getAll(filter?.vehicleId);
      const expenses = await expenseService.getAll(filter?.vehicleId);
      
      let csv = 'نوع,تاریخ,مبلغ,توضیحات\n';
      
      services.forEach(s => {
        csv += `سرویس - ${s.type},${s.date},${s.cost},${s.note || ''}\n`;
      });
      
      expenses.forEach(e => {
        csv += `هزینه - ${e.category},${e.date},${e.amount},${e.note || ''}\n`;
      });
      
      // Add BOM for Persian text support
      const BOM = '\uFEFF';
      return new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
    }

    const response = await api.get('/reports/export/csv/', {
      params: filter,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Export report as PDF (Pro feature)
   */
  async exportPDF(filter?: ReportFilter): Promise<Blob> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, this would generate a PDF
      // For mock, just return an empty blob
      return new Blob(['PDF content'], { type: 'application/pdf' });
    }

    const response = await api.get('/reports/export/pdf/', {
      params: filter,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get monthly expense trend
   */
  async getMonthlyTrend(vehicleId?: string, months = 6): Promise<{ month: string; amount: number }[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Generate mock trend data
      return [
        { month: '1403/04', amount: 620000 },
        { month: '1403/05', amount: 890000 },
        { month: '1403/06', amount: 1100000 },
        { month: '1403/07', amount: 750000 },
        { month: '1403/08', amount: 1300000 },
        { month: '1403/09', amount: 980000 },
      ].slice(-months);
    }

    const response = await api.get<ApiResponse<{ month: string; amount: number }[]>>(
      '/reports/trend/monthly/',
      { params: { vehicle_id: vehicleId, months } }
    );
    return response.data.data;
  },

  /**
   * Download file helper
   */
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

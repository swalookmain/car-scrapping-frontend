import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  HiOutlineSparkles,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineClock,
} from 'react-icons/hi2';
import { BsChevronRight, BsCircleFill } from 'react-icons/bs';
import {
  LocalParking,
  Groups,
  Gavel,
  Inventory2,
  ReceiptLong,
  LocalShipping,
  AssignmentInd,
  ShoppingCart,
  Bolt,
  Balance,
} from '@mui/icons-material';
import { dashboardApi } from '../../../services/api';
import { formatINR } from '../../../services/taxEngine';
import usePermissions from '../../../hooks/usePermissions';
import SafeChart from '../SafeChart';
import { YARD_STATUS_LABELS, YARD_STATUS_COLORS } from '../../yard-management/yardConstants';

const STALE_TIME = 3 * 60 * 1000;

function formatMonthLabel() {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function formatCompactINR(amount) {
  if (amount == null || Number.isNaN(amount)) return '—';
  const n = Number(amount);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return formatINR(n);
}

function formatAuctionCountdown(endDate) {
  if (!endDate) return '';
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h left`;
}

const KPI_CONFIG = [
  {
    key: 'yardTotal',
    label: 'Vehicles in Yard',
    icon: LocalParking,
    href: '/yard',
    gradient: 'from-[#1a1040] via-[#4527a0] to-[#673ab7]',
    accent: '#b39ddb',
    permission: 'yard:view',
  },
  {
    key: 'activeLeads',
    label: 'Active Leads',
    icon: Groups,
    href: '/leads',
    gradient: 'from-[#0d2137] via-[#1565c0] to-[#2196f3]',
    accent: '#90caf9',
    permission: 'lead:view',
    adminOnly: true,
  },
  {
    key: 'activeAuctions',
    label: 'Live Auctions',
    icon: Gavel,
    href: '/auctions',
    gradient: 'from-[#3e1a00] via-[#e65100] to-[#ff8a65]',
    accent: '#ffcc80',
  },
  {
    key: 'partsInStock',
    label: 'Parts in Stock',
    icon: Inventory2,
    href: '/inventory',
    gradient: 'from-[#0a2e1f] via-[#2e7d32] to-[#00c853]',
    accent: '#69f0ae',
    permission: 'inventory:view',
  },
  {
    key: 'purchaseSpendMtd',
    label: 'Purchase Spend',
    icon: ShoppingCart,
    href: '/invoices',
    gradient: 'from-[#2d1b4e] via-[#512da8] to-[#7e57c2]',
    accent: '#b39ddb',
    permission: 'invoice:view',
    format: 'currency',
    trendKey: 'purchaseSpendMtd',
  },
  {
    key: 'salesRevenueMtd',
    label: 'Sales Revenue',
    icon: ReceiptLong,
    href: '/sales/invoices',
    gradient: 'from-[#1a237e] via-[#3949ab] to-[#5c6bc0]',
    accent: '#9fa8da',
    permission: 'salesInvoice:view',
    format: 'currency',
    trendKey: 'salesRevenueMtd',
  },
];

const QUICK_ACTIONS = [
  { label: 'New Lead', href: '/leads', icon: AssignmentInd, permission: 'lead:create' },
  { label: 'Purchase Invoice', href: '/invoices', icon: ReceiptLong, permission: 'invoice:create' },
  { label: 'Yard', href: '/yard', icon: LocalParking, permission: 'yard:view' },
  { label: 'Sales Invoice', href: '/sales/invoices', icon: LocalShipping, permission: 'salesInvoice:create' },
];

const ALERT_STYLES = {
  high: { border: '#ef5350', bg: 'rgba(239,83,80,0.08)', dot: '#f44336' },
  medium: { border: '#ff9800', bg: 'rgba(255,152,0,0.08)', dot: '#ff9800' },
  low: { border: '#673ab7', bg: 'rgba(103,58,183,0.06)', dot: '#673ab7' },
};

function TrendBadge({ changePercent, dark }) {
  if (changePercent == null) return null;
  const positive = changePercent >= 0;
  const Icon = positive ? HiOutlineArrowTrendingUp : HiOutlineArrowTrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
        dark
          ? positive
            ? 'bg-emerald-500/20 text-emerald-200'
            : 'bg-red-500/20 text-red-200'
          : positive
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-600'
      }`}
    >
      <Icon className="text-xs" />
      {positive ? '+' : ''}
      {changePercent}%
    </span>
  );
}

function RingGauge({ percent, label, sublabel }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(percent, 100) / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle className="dashboard-ring-track" cx="60" cy="60" r={r} />
          <circle
            className="dashboard-ring-fill"
            cx="60"
            cy="60"
            r={r}
            stroke="url(#ringGrad)"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#673ab7" />
              <stop offset="100%" stopColor="#2196f3" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{percent}%</span>
          <span className="text-[10px] text-white/50 uppercase tracking-wide">{label}</span>
        </div>
      </div>
      {sublabel && <p className="text-xs text-white/45 mt-2 text-center">{sublabel}</p>}
    </div>
  );
}

function KpiCard({ config, value, trend, onClick }) {
  const Icon = config.icon;
  const display =
    config.format === 'currency' ? formatCompactINR(value) : (value ?? 0).toLocaleString('en-IN');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4 text-left w-full card-hover group cursor-pointer bg-linear-to-br ${config.gradient}`}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.12)' }}
    >
      <div className="dashboard-kpi-shine absolute inset-0 pointer-events-none" />
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20" style={{ background: config.accent }} />
      <div className="relative z-10 flex flex-col h-full min-h-[86px]">
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.22)' }}>
            <Icon sx={{ color: '#fff', fontSize: 22 }} />
          </div>
          {trend != null && <TrendBadge changePercent={trend} dark />}
        </div>
        <p className="text-white text-2xl font-bold mt-auto tracking-tight">{display}</p>
        <p className="text-white/70 text-xs font-medium mt-0.5">{config.label}</p>
      </div>
      <BsChevronRight className="absolute bottom-4 right-4 text-white/30 group-hover:text-white/70 transition-colors text-sm" />
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="h-14 rounded-xl bg-grey-200 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[118px] rounded-2xl bg-grey-200 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-72 rounded-2xl bg-grey-200 animate-pulse" />
        <div className="lg:col-span-4 h-72 rounded-2xl bg-grey-200 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl bg-grey-200 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

const OperationsDashboard = () => {
  const navigate = useNavigate();
  const { canPerform, isAdmin } = usePermissions();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardApi.getOverview(),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const overview = data?.data ?? data;
  const kpis = overview?.kpis ?? {};
  const trends = overview?.trends ?? {};
  const insights = overview?.insights ?? {};
  const yardByStatus = overview?.yardByStatus ?? [];
  const alerts = overview?.alerts ?? [];
  const weeklyActivity = overview?.weeklyActivity ?? [];
  const upcomingAuctions = overview?.upcomingAuctions ?? [];
  const leadBreakdown = overview?.leadBreakdown ?? {};

  const visibleKpis = KPI_CONFIG.filter(
    (c) => (!c.adminOnly || isAdmin) && (!c.permission || canPerform(c.permission)),
  );

  const yardChart = useMemo(() => {
    const active = yardByStatus.filter((item) => item.status !== 'EXITED' && item.count > 0);
    return {
      type: 'donut',
      height: 260,
      options: {
        chart: { animations: { enabled: true, speed: 400 } },
        labels: active.map((item) => YARD_STATUS_LABELS[item.status] || item.status),
        colors: active.map((item) => YARD_STATUS_COLORS[item.status]?.color || '#673ab7'),
        legend: { position: 'bottom', fontSize: '11px' },
        dataLabels: { enabled: false },
        plotOptions: {
          pie: {
            donut: {
              size: '68%',
              labels: {
                show: true,
                total: { show: true, label: 'Active', fontSize: '11px', formatter: () => String(active.reduce((s, i) => s + i.count, 0)) },
              },
            },
          },
        },
        stroke: { width: 2, colors: ['#fff'] },
      },
      series: active.map((item) => item.count),
    };
  }, [yardByStatus]);

  const weeklyChart = useMemo(() => ({
    type: 'area',
    height: 260,
    options: {
      chart: { toolbar: { show: false }, sparkline: { enabled: false } },
      stroke: { curve: 'smooth', width: 2.5 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 },
      },
      colors: ['#673ab7', '#2196f3'],
      dataLabels: { enabled: false },
      legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
      xaxis: {
        categories: weeklyActivity.map((w) => w.label),
        labels: { style: { fontSize: '11px' } },
      },
      yaxis: {
        labels: { formatter: (v) => formatCompactINR(v), style: { fontSize: '10px' } },
      },
      grid: { borderColor: '#eef2f6', strokeDashArray: 4 },
      tooltip: { y: { formatter: (v) => formatINR(v) } },
    },
    series: [
      { name: 'Purchases', data: weeklyActivity.map((w) => w.purchases) },
      { name: 'Sales', data: weeklyActivity.map((w) => w.sales) },
    ],
  }), [weeklyActivity]);

  const monthlyChart = useMemo(() => {
    const purchaseSpend = kpis.purchaseSpendMtd ?? 0;
    const salesRevenue = kpis.salesRevenueMtd ?? 0;
    return {
      type: 'bar',
      height: 200,
      options: {
        chart: { toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 10, columnWidth: '40%', distributed: true } },
        colors: ['#673ab7', '#2196f3'],
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: { categories: ['Purchases', 'Sales'], labels: { style: { fontWeight: 600 } } },
        yaxis: { labels: { formatter: (v) => formatCompactINR(v) } },
        grid: { borderColor: '#eef2f6', strokeDashArray: 4 },
        tooltip: { y: { formatter: (v) => formatINR(v) } },
      },
      series: [{ name: 'Amount', data: [purchaseSpend, salesRevenue] }],
    };
  }, [kpis.purchaseSpendMtd, kpis.salesRevenueMtd]);

  const leadFunnelChart = useMemo(() => {
    const open = leadBreakdown.open ?? 0;
    const inProcess = leadBreakdown.inProcess ?? 0;
    if (open === 0 && inProcess === 0) return null;
    return {
      type: 'bar',
      height: 120,
      options: {
        chart: { toolbar: { show: false }, sparkline: { enabled: true } },
        plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '55%', distributed: true } },
        colors: ['#2196f3', '#673ab7'],
        dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: 600 } },
        xaxis: { categories: ['Open', 'In Process'] },
        legend: { show: false },
        grid: { show: false },
      },
      series: [{ data: [open, inProcess] }],
    };
  }, [leadBreakdown]);

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-grey-600">Could not load dashboard data.</p>
        <button type="button" onClick={() => refetch()} className="px-5 py-2 rounded-xl bg-secondary-main text-white text-sm font-medium cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  const orgName = overview?.organization?.name ?? 'Your Yard';
  const quickActions = QUICK_ACTIONS.filter((a) => !a.permission || canPerform(a.permission));
  const netFlow = insights.netCashFlow ?? 0;
  const sellThrough = insights.sellThroughRatio;
  const yardUtil = insights.yardUtilization ?? 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up pb-6">
      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-grey-100">
        <div className="absolute left-0 top-0 w-16 h-1 rounded-full bg-linear-to-r from-secondary-main to-primary-main" />
        <div className="pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-secondary-main mb-1">ScrapNiti</p>
          <h1 className="text-2xl font-bold text-grey-900 tracking-tight">{orgName}</h1>
          <p className="text-sm text-grey-500 mt-0.5">{formatMonthLabel()} · Operations</p>
        </div>
        {quickActions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.href)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer transition-all hover:scale-[1.03] hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #673ab7, #512da8)' }}
                >
                  <Icon sx={{ fontSize: 15 }} />
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 dashboard-stagger">
        {visibleKpis.map((config) => (
          <KpiCard
            key={config.key}
            config={config}
            value={kpis[config.key]}
            trend={config.trendKey ? trends[config.trendKey]?.changePercent : undefined}
            onClick={() => navigate(config.href)}
          />
        ))}
      </div>

      {/* Bento: Weekly trend + Smart insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section
          className="lg:col-span-8 bg-paper rounded-2xl p-5 card-hover overflow-hidden relative"
          style={{ boxShadow: 'var(--shadow-md)', border: '1px solid rgba(103,58,183,0.1)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.04]" style={{ background: '#673ab7', filter: 'blur(40px)' }} />
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-2">
              <Bolt sx={{ color: 'var(--color-secondary-main)', fontSize: 22 }} />
              <div>
                <h2 className="text-base font-semibold text-grey-900">6-Week Cash Flow</h2>
                <p className="text-xs text-grey-500">Purchase vs sales momentum</p>
              </div>
            </div>
          </div>
          {weeklyActivity.length > 0 ? (
            <SafeChart key={weeklyActivity.map((w) => w.label).join('-')} {...weeklyChart} />
          ) : (
            <div className="h-52 flex items-center justify-center text-grey-400 text-sm">Not enough weekly data yet</div>
          )}
        </section>

        <section className="lg:col-span-4 dashboard-insight-glow rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
          <div className="dashboard-mesh-orb w-32 h-32 -top-10 -right-10" style={{ background: 'rgba(103,58,183,0.35)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Balance sx={{ color: '#b39ddb', fontSize: 20 }} />
              <h2 className="text-sm font-semibold text-white">Smart Insights</h2>
            </div>
            <p className="text-[11px] text-white/40 mb-4">Derived from your live data</p>

            <RingGauge
              percent={yardUtil}
              label="Yard Active"
              sublabel="Vehicles past arrival stage"
            />

            <div className="mt-5 space-y-3">
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[10px] text-white/45 uppercase tracking-wide">Net cash flow (MTD)</p>
                <p className={`text-xl font-bold mt-0.5 ${netFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {netFlow >= 0 ? '+' : ''}{formatCompactINR(netFlow)}
                </p>
                <p className="text-[10px] text-white/35 mt-1">Sales revenue minus purchase spend</p>
              </div>

              {sellThrough != null && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10px] text-white/45 uppercase tracking-wide">Sell-through ratio</p>
                  <p className="text-xl font-bold text-white mt-0.5">{sellThrough}%</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-secondary-main to-primary-main transition-all duration-1000"
                      style={{ width: `${Math.min(sellThrough, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {(insights.dismantling ?? 0) > 0 && (
                <div className="flex items-center justify-between text-xs text-white/55 px-1">
                  <span>Dismantling now</span>
                  <span className="font-bold text-white">{insights.dismantling} vehicles</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Triple panel: Yard | Auctions | Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="bg-paper rounded-2xl p-5 card-hover" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid rgba(103,58,183,0.08)' }}>
          <h2 className="text-sm font-semibold text-grey-900 mb-0.5">Yard Breakdown</h2>
          <p className="text-xs text-grey-500 mb-3">Live status split</p>
          {yardChart.series.length > 0 ? (
            <SafeChart key={yardChart.series.join('-')} {...yardChart} />
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-grey-400">
              <LocalParking sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
              <p className="text-sm">No vehicles yet</p>
            </div>
          )}
        </section>

        <section className="bg-paper rounded-2xl p-5 card-hover" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid rgba(255,152,0,0.12)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-grey-900">Upcoming Auctions</h2>
              <p className="text-xs text-grey-500">Next deadlines</p>
            </div>
            <button type="button" onClick={() => navigate('/auctions')} className="text-xs text-secondary-main font-medium cursor-pointer hover:underline">
              View all
            </button>
          </div>
          {upcomingAuctions.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-grey-400">
              <Gavel sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
              <p className="text-sm">No upcoming auctions</p>
            </div>
          ) : (
            <div className="relative dashboard-auction-timeline pl-2 space-y-3 max-h-64 overflow-y-auto">
              {upcomingAuctions.map((auction) => (
                <button
                  key={auction.id}
                  type="button"
                  onClick={() => navigate('/auctions')}
                  className="relative flex gap-3 w-full text-left pl-8 pr-2 py-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-colors"
                >
                  <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-grey-900 truncate">#{auction.auctionNumber}</p>
                    <p className="text-[11px] text-grey-500 truncate">{auction.auctionerName || 'MSTC'}</p>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-orange-600 font-medium">
                      <HiOutlineClock className="text-xs" />
                      {formatAuctionCountdown(auction.endDateTime)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 self-start">
                    {auction.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-paper rounded-2xl p-5 card-hover flex flex-col" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid rgba(239,83,80,0.1)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-grey-900">Action Required</h2>
              <p className="text-xs text-grey-500">COD · RTO · follow-ups</p>
            </div>
            {alerts.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">{alerts.length}</span>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1 max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-6 text-center">
                <HiOutlineSparkles className="text-emerald-500 text-3xl mb-2" />
                <p className="text-sm font-medium text-grey-800">All clear</p>
              </div>
            ) : (
              alerts.map((alert, idx) => {
                const style = ALERT_STYLES[alert.priority] || ALERT_STYLES.low;
                return (
                  <button
                    key={`${alert.type}-${idx}`}
                    type="button"
                    onClick={() => navigate(alert.href)}
                    className="flex items-start gap-2.5 w-full text-left p-3 rounded-xl cursor-pointer hover:scale-[1.01] transition-transform"
                    style={{ background: style.bg, borderLeft: `3px solid ${style.border}` }}
                  >
                    <BsCircleFill className="text-[7px] mt-1.5 shrink-0" style={{ color: style.dot }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-grey-900 leading-snug">{alert.title}</p>
                      {alert.subtitle && <p className="text-[10px] text-grey-500 mt-0.5">{alert.subtitle}</p>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Lead funnel (admin) + monthly bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {isAdmin && leadFunnelChart && (
          <section className="lg:col-span-4 bg-paper rounded-2xl p-5 card-hover" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-grey-100)' }}>
            <h2 className="text-sm font-semibold text-grey-900 mb-0.5">Lead Pipeline</h2>
            <p className="text-xs text-grey-500 mb-3">Open vs in-process split</p>
            <SafeChart {...leadFunnelChart} />
            <button type="button" onClick={() => navigate('/leads')} className="mt-2 text-xs text-secondary-main font-medium cursor-pointer hover:underline">
              Manage leads →
            </button>
          </section>
        )}

        {(canPerform('invoice:view') || canPerform('salesInvoice:view')) && (
          <section
            className={`bg-paper rounded-2xl p-5 card-hover ${isAdmin && leadFunnelChart ? 'lg:col-span-8' : 'lg:col-span-12'}`}
            style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-grey-100)' }}
          >
            <h2 className="text-sm font-semibold text-grey-900 mb-0.5">MTD Purchase vs Sales</h2>
            <p className="text-xs text-grey-500 mb-4">Month snapshot comparison</p>
            <SafeChart key={`${kpis.purchaseSpendMtd}-${kpis.salesRevenueMtd}`} {...monthlyChart} />
          </section>
        )}
      </div>
    </div>
  );
};

export default OperationsDashboard;

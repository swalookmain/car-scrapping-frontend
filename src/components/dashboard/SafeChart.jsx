import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

/**
 * SafeChart – uses vanilla apexcharts directly (no react-apexcharts).
 * - Clears container innerHTML before each init to avoid stale SVG state
 * - Assigns a unique chart ID per instance to avoid global registry clashes
 * - Pass a `key` prop from the parent to trigger clean remount on data changes
 */

let _chartIdCounter = 0;

const SafeChart = ({
  options = {},
  series = [],
  type = 'line',
  height = 350,
  width = '100%',
}) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const chartIdRef = useRef(`safechart-${++_chartIdCounter}`);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any leftover SVG/HTML from a previous instance
    containerRef.current.innerHTML = '';

    // Build plain config — JSON round-trip strips any non-serialisable values
    // and ensures every nested object has a proper prototype (no Object.create(null))
    let config;
    try {
      const userChart = options.chart || {};
      const defaultChart = {
        animations: { enabled: false, animateGradually: { enabled: false }, dynamicAnimation: { enabled: false } },
        redrawOnParentResize: false,
      };
      const chartCfg = {
        ...defaultChart,
        ...userChart,
        id: chartIdRef.current,
        type,
        height,
        width,
      };

      const raw = {
        ...options,
        chart: chartCfg,
        series,
      };
      config = JSON.parse(JSON.stringify(raw));
    } catch (e) {
      console.warn('[SafeChart] config serialisation failed', e);
      return;
    }

    try {
      const chart = new ApexCharts(containerRef.current, config);
      chart.render();
      chartRef.current = chart;
    } catch (e) {
      console.warn('[SafeChart] render error', e);
    }

    return () => {
      if (chartRef.current) {
        try { chartRef.current.destroy(); } catch (_) {}
        chartRef.current = null;
      }
    };
    // Intentionally empty deps — parent uses `key` to trigger remount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle = {
    minHeight: typeof height === 'number' ? height : undefined,
    width: typeof width === 'number' ? `${width}px` : width,
  };

  return <div ref={containerRef} style={containerStyle} />;
};

export default React.memo(SafeChart);

'use client';

import { useMonitoring } from '@/hooks/use-monitoring';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    RefreshCw,
    TrendingUp,
    Clock,
    AlertCircle,
    CheckCircle,
    Activity
} from 'lucide-react';

export default function MonitoringPage() {
    const { stats, loading, error, refresh } = useMonitoring(100, 30000);

    const formatLatency = (ms: number) => {
        if (ms < 1000) return `${Math.round(ms)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white p-8 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center text-red-400">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-lg">{error}</p>
                        <Button onClick={refresh} className="mt-4 bg-white text-black hover:bg-gray-200">
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">API Monitoring Dashboard</h1>
                        <p className="text-gray-400 mt-1">Track AI API usage, costs, and performance</p>
                    </div>
                    <Button
                        onClick={refresh}
                        disabled={loading}
                        className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white border border-[#3A3A3A]"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-[#151515] border-[#2A2A2A] p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <Activity className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total API Calls</p>
                                <p className="text-2xl font-bold text-white">
                                    {stats?.summary.totalCalls || 0}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#151515] border-[#2A2A2A] p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Success Rate</p>
                                <p className="text-2xl font-bold text-white">
                                    {stats?.summary.successRate.toFixed(1) || 0}%
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#151515] border-[#2A2A2A] p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/20 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Avg Latency</p>
                                <p className="text-2xl font-bold text-white">
                                    {formatLatency(stats?.summary.averageLatencyMs || 0)}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* <Card className="bg-[#151515] border-[#2A2A2A] p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <DollarSign className="h-6 w-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Estimated Cost</p>
                                <p className="text-2xl font-bold text-white">
                                    {formatCost(stats?.summary.totalEstimatedCost || 0)}
                                </p>
                            </div>
                        </div>
                    </Card> */}
                </div>

                {/* Today's Stats and Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Today's Stats */}
                    <Card className="bg-[#151515] border-[#2A2A2A] p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                            <TrendingUp className="h-5 w-5 text-gray-400" />
                            Today&apos;s Stats
                        </h2>
                        {stats?.today ? (
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Calls</span>
                                    <span className="font-medium text-white">{stats.today.totalCalls}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Successful</span>
                                    <span className="font-medium text-green-400">{stats.today.successCalls}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Failed</span>
                                    <span className="font-medium text-red-400">{stats.today.errorCalls}</span>
                                </div>
                                {/* <div className="flex justify-between">
                                    <span className="text-gray-400">Cost</span>
                                    <span className="font-medium text-white">{formatCost(stats.today.totalEstimatedCost)}</span>
                                </div> */}
                            </div>
                        ) : (
                            <p className="text-gray-500">No data for today yet</p>
                        )}
                    </Card>

                    {/* Calls by Endpoint */}
                    <Card className="bg-[#151515] border-[#2A2A2A] p-6">
                        <h2 className="text-lg font-semibold mb-4 text-white">By Endpoint</h2>
                        <div className="space-y-3">
                            {stats?.callsByEndpoint && Object.entries(stats.callsByEndpoint).map(([endpoint, count]) => (
                                <div key={endpoint} className="flex justify-between items-center">
                                    <span className="text-gray-300 text-sm truncate max-w-[150px]">{endpoint}</span>
                                    <span className="font-medium bg-[#2A2A2A] text-white px-3 py-1 rounded-full text-sm border border-[#3A3A3A]">{count}</span>
                                </div>
                            ))}
                            {(!stats?.callsByEndpoint || Object.keys(stats.callsByEndpoint).length === 0) && (
                                <p className="text-gray-500">No data yet</p>
                            )}
                        </div>
                    </Card>

                    {/* Calls by Provider */}
                    <Card className="bg-[#151515] border-[#2A2A2A] p-6">
                        <h2 className="text-lg font-semibold mb-4 text-white">By Provider</h2>
                        <div className="space-y-3">
                            {stats?.callsByProvider && Object.entries(stats.callsByProvider).map(([provider, count]) => (
                                <div key={provider} className="flex justify-between items-center">
                                    <span className="text-gray-300 capitalize">{provider}</span>
                                    <span className="font-medium bg-[#2A2A2A] text-white px-3 py-1 rounded-full text-sm border border-[#3A3A3A]">{count}</span>
                                </div>
                            ))}
                            {(!stats?.callsByProvider || Object.keys(stats.callsByProvider).length === 0) && (
                                <p className="text-gray-500">No data yet</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Recent API Calls */}
                <Card className="bg-[#151515] border-[#2A2A2A] p-6">
                    <h2 className="text-lg font-semibold mb-4 text-white">Recent API Calls</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-gray-400 text-sm border-b border-[#2A2A2A]">
                                    <th className="text-left py-3 px-2 font-medium">Timestamp</th>
                                    <th className="text-left py-3 px-2 font-medium">Endpoint</th>
                                    <th className="text-left py-3 px-2 font-medium">Provider</th>
                                    <th className="text-left py-3 px-2 font-medium">Model</th>
                                    <th className="text-left py-3 px-2 font-medium">Status</th>
                                    <th className="text-left py-3 px-2 font-medium">Latency</th>
                                    {/* <th className="text-left py-3 px-2 font-medium">Cost</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recentCalls.map((call) => (
                                    <tr key={call.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]">
                                        <td className="py-3 px-2 text-sm text-gray-300">{formatTimestamp(call.created_at)}</td>
                                        <td className="py-3 px-2 text-sm font-mono text-blue-400">{call.endpoint}</td>
                                        <td className="py-3 px-2 text-sm capitalize text-gray-300">{call.provider}</td>
                                        <td className="py-3 px-2 text-sm font-mono text-gray-400">{call.model}</td>
                                        <td className="py-3 px-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${call.status === 'success'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {call.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-sm text-gray-300">{formatLatency(call.latency_ms)}</td>
                                        {/* <td className="py-3 px-2 text-sm text-gray-300">{call.estimated_cost ? formatCost(call.estimated_cost) : '-'}</td> */}
                                    </tr>
                                ))}
                                {(!stats?.recentCalls || stats.recentCalls.length === 0) && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-500">
                                            No API calls recorded yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Top Errors */}
                {stats?.topErrors && stats.topErrors.length > 0 && (
                    <Card className="bg-[#151515] border-[#2A2A2A] p-6 mt-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            Top Errors
                        </h2>
                        <div className="space-y-2">
                            {stats.topErrors.map((error, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                    <span className="text-sm text-red-300 truncate max-w-[80%]">{error.error}</span>
                                    <span className="text-sm font-medium bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30">
                                        {error.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Token Usage */}
                <Card className="bg-[#151515] border-[#2A2A2A] p-6 mt-6">
                    <h2 className="text-lg font-semibold mb-4 text-white">Token Usage</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                            <p className="text-gray-400 text-sm">Total Input Tokens</p>
                            <p className="text-2xl font-bold text-white">
                                {(stats?.summary.totalInputTokens || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                            <p className="text-gray-400 text-sm">Total Output Tokens</p>
                            <p className="text-2xl font-bold text-white">
                                {(stats?.summary.totalOutputTokens || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

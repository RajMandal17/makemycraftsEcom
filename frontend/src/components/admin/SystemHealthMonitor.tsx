

import React, { useState, useEffect } from 'react';
import { adminWebSocketClient, DashboardUpdate } from '../../services/adminWebSocketClient';
import { CheckCircle, AlertTriangle, XCircle, Server, HardDrive, Cpu, Clock } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  responseTime: number;
  lastChecked: string;
}

interface SystemHealthData {
  status: string;
  activeServices: number;
  totalServices: number;
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  services?: ServiceStatus[];
}

const SystemHealthMonitor: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthData>({
    status: 'UNKNOWN',
    activeServices: 0,
    totalServices: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    uptime: 0,
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    
    connectWebSocket();

    return () => {
      
      adminWebSocketClient.disconnect();
    };
  }, []);

  
  const connectWebSocket = async () => {
    try {
      await adminWebSocketClient.connect();
      setIsConnected(true);

      
      adminWebSocketClient.subscribeToDashboard((data: DashboardUpdate) => {
        if (data.systemHealth) {
          setHealthData({
            status: data.systemHealth.status,
            activeServices: data.systemHealth.activeServices,
            totalServices: data.systemHealth.totalServices,
            cpuUsage: data.systemHealth.cpuUsage,
            memoryUsage: data.systemHealth.memoryUsage,
            uptime: 0, 
          });
        }
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setIsConnected(false);
    }
  };

  
  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'HEALTHY':
      case 'UP':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'DEGRADED':
      case 'WARNING':
        return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'DOWN':
      case 'ERROR':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <Server className="text-gray-500" size={24} />;
    }
  };

  
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'HEALTHY':
      case 'UP':
        return 'text-green-600 bg-green-100';
      case 'DEGRADED':
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-100';
      case 'DOWN':
      case 'ERROR':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  
  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">System Health</h2>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(healthData.status)}
            <div>
              <p className="text-sm text-gray-600">Overall Status</p>
              <p className={`text-lg font-semibold ${getStatusColor(healthData.status).split(' ')[0]}`}>
                {healthData.status}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Services</p>
            <p className="text-lg font-semibold">
              {healthData.activeServices} / {healthData.totalServices}
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {}
        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Cpu className="text-blue-500" size={16} />
            <span className="text-sm font-medium text-gray-700">CPU Usage</span>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold">{healthData.cpuUsage.toFixed(1)}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(healthData.cpuUsage)}`}
              style={{ width: `${Math.min(healthData.cpuUsage, 100)}%` }}
            ></div>
          </div>
        </div>

        {}
        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <HardDrive className="text-purple-500" size={16} />
            <span className="text-sm font-medium text-gray-700">Memory Usage</span>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold">{healthData.memoryUsage.toFixed(1)}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(healthData.memoryUsage)}`}
              style={{ width: `${Math.min(healthData.memoryUsage, 100)}%` }}
            ></div>
          </div>
        </div>

        {}
        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="text-green-500" size={16} />
            <span className="text-sm font-medium text-gray-700">Uptime</span>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold">{formatUptime(healthData.uptime)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">System running smoothly</p>
        </div>
      </div>

      {}
      {healthData.services && healthData.services.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Service Status</h3>
          <div className="space-y-2">
            {healthData.services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium text-gray-800">{service.name}</p>
                    <p className="text-xs text-gray-500">
                      Response: {service.responseTime}ms
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {(!healthData.services || healthData.services.length === 0) && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">Service details will appear here</p>
        </div>
      )}
    </div>
  );
};

export default SystemHealthMonitor;


import React from 'react';

interface AnalysisResult {
  status: 'normal' | 'abnormal' | 'insufficient';
  stability: number;
  message: string;
  details: {
    accelerometerVariability: number;
    gyroscopeVariability: number;
    totalMovement: number;
    balanceScore: number;
  };
}

interface AnalysisResultsProps {
  analysisResult: AnalysisResult | null;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysisResult }) => {
  if (!analysisResult) return null;

  return (
    <div className={`p-4 rounded-lg border ${
      analysisResult.status === 'normal' 
        ? 'bg-green-50 border-green-200' 
        : analysisResult.status === 'abnormal'
          ? 'bg-red-50 border-red-200'
          : 'bg-gray-50 border-gray-200'
    }`}>
      <h3 className="font-medium mb-2 text-gray-800">Balance Analysis Results</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${
            analysisResult.status === 'normal'
              ? 'text-green-600'
              : analysisResult.status === 'abnormal'
                ? 'text-red-600'
                : 'text-gray-600'
          }`}>
            {analysisResult.status.charAt(0).toUpperCase() + analysisResult.status.slice(1)}
          </span>
        </div>
        
        {analysisResult.status !== 'insufficient' && (
          <>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Balance Score:</span>
              <span className="font-medium">{analysisResult.stability.toFixed(1)}%</span>
            </div>
            
            <div className="mt-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Movement Variability:</span>
                <span>{analysisResult.details.accelerometerVariability.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>Rotation Stability:</span>
                <span>{analysisResult.details.gyroscopeVariability.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Movement:</span>
                <span>{analysisResult.details.totalMovement.toFixed(3)}</span>
              </div>
            </div>
          </>
        )}
        
        <p className="text-sm text-gray-700 italic mt-2">
          {analysisResult.message}
        </p>
        
        {analysisResult.status === 'abnormal' && (
          <div className="mt-2 p-2 bg-amber-100 rounded text-xs text-amber-800">
            <strong>Recommendation:</strong> Consider consulting a healthcare professional for further evaluation.
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;

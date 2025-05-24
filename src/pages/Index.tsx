
import React, { useState, useEffect } from "react";
import { useSensors } from "@/hooks/useSensors";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertCircle, 
  Play,
  CheckCircle,
  Activity
} from "lucide-react";
import { saveBalanceData } from "@/utils/balanceDataUtils";
import { analyzeBalance } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const {
    currentReadings,
    recordings,
    isRecording,
    startRecording,
    stopRecording,
    clearRecordings,
    requestPermissions,
    permissionStatus,
    sensorsAvailable,
  } = useSensors();

  const [testProgress, setTestProgress] = useState(0);
  const [testComplete, setTestComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();

  const allPermissionsGranted = 
    permissionStatus.accelerometer && 
    permissionStatus.gyroscope && 
    permissionStatus.magnetometer;

  // Handle 15-second test timer
  useEffect(() => {
    if (!isRecording) return;

    const duration = 15000; // 15 seconds
    const interval = 100; // Update every 100ms
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const progress = (elapsed / duration) * 100;
      setTestProgress(progress);

      if (elapsed >= duration) {
        handleStopTest();
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isRecording]);

  const handleStartTest = async () => {
    if (!allPermissionsGranted) {
      await requestPermissions();
      return;
    }

    setTestProgress(0);
    setTestComplete(false);
    setAnalysisResult(null);
    clearRecordings();
    startRecording();
  };

  const handleStopTest = async () => {
    stopRecording();
    setTestComplete(true);
    
    // Save data to device storage
    try {
      await saveBalanceData(recordings);
      toast({
        title: "Recording complete",
        description: "Data saved to BalanceData folder",
      });
      
      // Simple analysis based on movement variability
      analyzeBalance();
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save data to device storage",
        variant: "destructive",
      });
    }
  };

  const analyzeBalance = () => {
    if (recordings.length < 50) {
      setAnalysisResult("Insufficient data for analysis");
      return;
    }

    // Calculate movement variability
    const accelVariability = calculateVariability(recordings.map(r => r.accelerometer));
    const gyroVariability = calculateVariability(recordings.map(r => r.gyroscope));
    
    // Simple threshold-based analysis
    const isAbnormal = accelVariability > 2.0 || gyroVariability > 1.5;
    
    setAnalysisResult(isAbnormal ? "Abnormal Movement Detected" : "Balance Normal");
  };

  const calculateVariability = (readings: any[]) => {
    const magnitudes = readings.map(r => Math.sqrt(r.x * r.x + r.y * r.y + r.z * r.z));
    const avg = magnitudes.reduce((sum, val) => sum + val, 0) / magnitudes.length;
    const variance = magnitudes.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / magnitudes.length;
    return Math.sqrt(variance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Balance Stroke Check</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center max-w-md">
        {/* Permission Request */}
        {!allPermissionsGranted && (
          <div className="w-full bg-amber-50 border border-amber-200 p-6 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-amber-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 mb-2">Sensor permissions required</h3>
                <p className="text-sm text-amber-700 mb-4">
                  This app needs access to your device's motion sensors for balance assessment.
                </p>
                <Button 
                  onClick={requestPermissions} 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Grant Permissions
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Test Interface */}
        <div className="w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {!isRecording && !testComplete && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Ready to start balance test
              </h2>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                Hold the phone at chest level and walk in a straight line for 15 seconds when prompted.
              </p>
              <Button
                onClick={handleStartTest}
                disabled={!allPermissionsGranted}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-medium rounded-xl"
                size="lg"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Balance Test
              </Button>
            </>
          )}

          {isRecording && (
            <>
              <h2 className="text-xl font-semibold text-blue-600 mb-4">
                Recording in progress...
              </h2>
              <p className="text-gray-700 mb-6 font-medium">
                Hold the phone at chest level and walk in a straight line
              </p>
              
              <div className="mb-6">
                <Progress value={testProgress} className="w-full h-3" />
                <p className="text-sm text-gray-500 mt-2">
                  {Math.round((15 - (testProgress / 100) * 15))} seconds remaining
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Data points collected: {recordings.length}</p>
              </div>
            </>
          )}

          {testComplete && (
            <>
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-green-600 mb-2">
                  Recording complete
                </h2>
                <p className="text-gray-600">Data saved to BalanceData folder</p>
              </div>

              {analysisResult && (
                <div className={`p-4 rounded-lg mb-6 ${
                  analysisResult.includes("Normal") 
                    ? "bg-green-50 border border-green-200"
                    : analysisResult.includes("Abnormal")
                      ? "bg-red-50 border border-red-200"
                      : "bg-gray-50 border border-gray-200"
                }`}>
                  <h3 className="font-medium mb-2">Analysis Result:</h3>
                  <p className={`font-semibold ${
                    analysisResult.includes("Normal") 
                      ? "text-green-700"
                      : analysisResult.includes("Abnormal")
                        ? "text-red-700"
                        : "text-gray-700"
                  }`}>
                    {analysisResult}
                  </p>
                  
                  {analysisResult.includes("Abnormal") && (
                    <p className="text-xs text-red-600 mt-2">
                      Consider consulting a healthcare professional for further evaluation.
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={() => {
                  setTestComplete(false);
                  setAnalysisResult(null);
                  clearRecordings();
                }}
                variant="outline"
                className="w-full"
              >
                Start New Test
              </Button>
            </>
          )}
        </div>

        {/* Data Summary */}
        {recordings.length > 0 && (
          <div className="w-full mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-800 mb-2">Test Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium ml-2">
                  {(recordings.length / 10).toFixed(1)}s
                </span>
              </div>
              <div>
                <span className="text-gray-600">Data points:</span>
                <span className="font-medium ml-2">{recordings.length}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

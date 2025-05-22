
import React from "react";
import { useSensors } from "@/hooks/useSensors";
import SensorReadings from "@/components/SensorReadings";
import SensorVisualizer from "@/components/SensorVisualizer";
import RecordingControls from "@/components/RecordingControls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  HelpCircle,
  Activity,
  RotateCw,
  Compass,
  Info
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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

  const allPermissionsGranted = 
    permissionStatus.accelerometer && 
    permissionStatus.gyroscope && 
    permissionStatus.magnetometer;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-medical-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-900">Balance Assessment</h1>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>About this app</SheetTitle>
                <SheetDescription>
                  This application helps assess body balance using your device's sensors.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center">
                    <Info className="w-4 h-4 mr-2 text-medical-600" />
                    How to use:
                  </h3>
                  <ol className="list-decimal pl-5 text-sm space-y-1 text-gray-600">
                    <li>Grant sensor permissions (if prompted)</li>
                    <li>Hold your device stable against the patient's body</li>
                    <li>Click "Start Recording" to collect data</li>
                    <li>Hold for 5-10 seconds for best results</li>
                    <li>Click "Stop Recording" when finished</li>
                    <li>Export data as CSV for further analysis</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                    Important notes:
                  </h3>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
                    <li>This app is for preliminary assessment only</li>
                    <li>Results should be verified by a healthcare professional</li>
                    <li>Different devices may have varying sensor accuracy</li>
                  </ul>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {!allPermissionsGranted && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Sensor permissions required</h3>
              <p className="text-sm text-amber-700">
                This app needs access to your device's motion and orientation sensors for body balance assessment.
              </p>
              <Button 
                onClick={requestPermissions} 
                variant="outline"
                className="mt-3 bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                Grant Permissions
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SensorReadings 
            title="Accelerometer" 
            readings={currentReadings.accelerometer}
            available={sensorsAvailable.accelerometer}
            hasPermission={permissionStatus.accelerometer}
          />
          <SensorReadings 
            title="Gyroscope" 
            readings={currentReadings.gyroscope}
            available={sensorsAvailable.gyroscope}
            hasPermission={permissionStatus.gyroscope}
          />
          <SensorReadings 
            title="Magnetometer" 
            readings={currentReadings.magnetometer}
            available={sensorsAvailable.magnetometer}
            hasPermission={permissionStatus.magnetometer}
          />
        </div>
        
        <Tabs defaultValue="accelerometer" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="accelerometer" className="flex items-center justify-center">
              <Activity className="w-4 h-4 mr-2 md:mr-2" />
              <span className="hidden md:inline">Accelerometer</span>
            </TabsTrigger>
            <TabsTrigger value="gyroscope" className="flex items-center justify-center">
              <RotateCw className="w-4 h-4 mr-2 md:mr-2" />
              <span className="hidden md:inline">Gyroscope</span>
            </TabsTrigger>
            <TabsTrigger value="magnetometer" className="flex items-center justify-center">
              <Compass className="w-4 h-4 mr-2 md:mr-2" />
              <span className="hidden md:inline">Magnetometer</span>
            </TabsTrigger>
          </TabsList>
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
            <TabsContent value="accelerometer">
              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900">Accelerometer Visualization</h3>
                <p className="text-sm text-gray-500">Linear acceleration (m/s²)</p>
              </div>
              <SensorVisualizer readings={currentReadings.accelerometer} type="accelerometer" />
            </TabsContent>
            <TabsContent value="gyroscope">
              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900">Gyroscope Visualization</h3>
                <p className="text-sm text-gray-500">Angular velocity (rad/s)</p>
              </div>
              <SensorVisualizer readings={currentReadings.gyroscope} type="gyroscope" />
            </TabsContent>
            <TabsContent value="magnetometer">
              <div className="text-center mb-4">
                <h3 className="font-medium text-gray-900">Magnetometer Visualization</h3>
                <p className="text-sm text-gray-500">Magnetic field orientation (degrees)</p>
              </div>
              <SensorVisualizer readings={currentReadings.magnetometer} type="magnetometer" />
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recording Controls</h2>
          <RecordingControls 
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onClearRecordings={clearRecordings}
            recordings={recordings}
            permissionsGranted={allPermissionsGranted}
            requestPermissions={requestPermissions}
          />
          
          {isRecording && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-full animate-pulse-slow">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Recording in progress: {recordings.length} data points
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
